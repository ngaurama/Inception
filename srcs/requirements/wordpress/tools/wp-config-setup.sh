#!/bin/sh

set -e
echo "Waiting for database..."
for i in {1..60}; do
    if mariadb -h "${WORDPRESS_DB_HOST}" -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; then
        echo "Database connection successful."
        break
    fi
    echo -n "."
    sleep 2
done

echo "Starting WordPress setup..."

if [ ! -f /var/www/wordpress/wp-config.php ]; then
    echo "Copying wp-config-sample.php to wp-config.php..."
    cp /var/www/wordpress/wp-config-sample.php /var/www/wordpress/wp-config.php

    WORDPRESS_DB_PASSWORD=$(cat /run/secrets/mariadb_wp_password)

    echo "Configuring wp-config.php..."
    sed -i "s/database_name_here/${WORDPRESS_DB_NAME}/" /var/www/wordpress/wp-config.php
    sed -i "s/username_here/${WORDPRESS_DB_USER}/" /var/www/wordpress/wp-config.php
    sed -i "s/password_here/${WORDPRESS_DB_PASSWORD}/" /var/www/wordpress/wp-config.php
    sed -i "s/localhost/${WORDPRESS_DB_HOST}/" /var/www/wordpress/wp-config.php
    sed -i "s/'wp_'/'${WORDPRESS_TABLE_PREFIX}'/" /var/www/wordpress/wp-config.php

    echo "Fetching WordPress salts..."
    SALTS=$(curl -s https://api.wordpress.org/secret-key/1.1/salt/ || 
    {
        cat <<EOF
define('AUTH_KEY',         'put-your-unique-phrase-here1');
define('SECURE_AUTH_KEY',  'put-your-unique-phrase-here2');
define('LOGGED_IN_KEY',    'put-your-unique-phrase-here3');
define('NONCE_KEY',        'put-your-unique-phrase-here4');
define('AUTH_SALT',        'put-your-unique-phrase-here5');
define('SECURE_AUTH_SALT', 'put-your-unique-phrase-here6');
define('LOGGED_IN_SALT',   'put-your-unique-phrase-here7');
define('NONCE_SALT',       'put-your-unique-phrase-here8');
EOF
    })

    echo "Inserting salts into wp-config.php..."
    echo "$SALTS" | sed -i "/\/\*\*#@-\*\//r /dev/stdin" /var/www/wordpress/wp-config.php
    sed -i "/put your unique phrase here/d" /var/www/wordpress/wp-config.php

    # BONUS REDIS CONFIGURATION
    echo "Configuring Redis cache settings after salts..."
    cat <<EOF > /tmp/redis_conf.txt
// Redis Object Cache settings
define('WP_REDIS_HOST', 'redis');
define('WP_REDIS_PORT', 6379);
define('WP_REDIS_TIMEOUT', 5);
define('WP_REDIS_READ_TIMEOUT', 5);
define('WP_CACHE_KEY_SALT', '${WORDPRESS_SITE_URL}:');
define('WP_CACHE', true);
define('WP_CONTENT_DIR', '/var/www/wordpress/wp-content');
define('REDIS_CACHE_METRICS', true);
EOF
    sed -i "/define('NONCE_SALT'/r /tmp/redis_conf.txt" /var/www/wordpress/wp-config.php
    rm /tmp/redis_conf.txt

else
    echo "wp-config.php already exists, skipping setup."
fi

echo "Waiting for database..."
for i in {1..60}; do
    if mariadb -h "${WORDPRESS_DB_HOST}" -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" -e "SELECT 1;" >/dev/null 2>&1; then
        echo "Database ready."
        break
    fi
    echo -n "."
    sleep 2
done

echo "Waiting for Redis..."
for i in {1..30}; do
    if redis-cli -h redis ping >/dev/null 2>&1; then
        echo "Redis ready."
        break
    fi
    echo -n "."
    sleep 2
done

# making sure proper permissions for wp directories for redis cause its so damn annoying
echo "Setting proper file permissions..."
mkdir -p /var/www/wordpress/wp-content/cache
mkdir -p /var/www/wordpress/wp-content/uploads
mkdir -p /tmp/wp-cache
chown -R nobody:nobody /var/www/wordpress
chown -R nobody:nobody /tmp/wp-cache
find /var/www/wordpress/ -type d -exec chmod 755 {} \;
find /var/www/wordpress/ -type f -exec chmod 644 {} \;
chmod 755 /var/www/wordpress/wp-content/cache
chmod 755 /tmp/wp-cache

set +e

echo "Checking WordPress installation..."
if mariadb -h "${WORDPRESS_DB_HOST}" -u "${WORDPRESS_DB_USER}" -p"${WORDPRESS_DB_PASSWORD}" -D "${WORDPRESS_DB_NAME}" -se "SELECT 1 FROM ${WORDPRESS_TABLE_PREFIX}options LIMIT 1;" >/dev/null 2>&1; then
    echo "WordPress already installed."
else
    echo "Installing WordPress..."
    wp core install \
        --path=/var/www/wordpress \
        --url="${WORDPRESS_SITE_URL}" \
        --title="${WORDPRESS_SITE_TITLE}" \
        --admin_user="${WORDPRESS_ADMIN_USER}" \
        --admin_password="$(cat /run/secrets/wordpress_admin_password)" \
        --admin_email="${WORDPRESS_ADMIN_EMAIL}" \
        --skip-email \
        --allow-root

    echo "Checking if user 'ngaurama' exists..."
    if ! wp user get ngaurama --path=/var/www/wordpress --allow-root >/dev/null 2>&1; then
        echo "Creating additional user 'ngaurama'..."
        wp user create ngaurama ngaurama@student.42.fr \
            --role=administrator \
            --user_pass="$(cat /run/secrets/ngaurama_password)" \
            --path=/var/www/wordpress \
            --allow-root
    else
        echo "User 'ngaurama' already exists, skipping creation."
    fi

    echo "Installing and enabling Redis Object Cache plugin..."
    rm -f /var/www/wordpress/wp-content/object-cache.php
    wp plugin install redis-cache --activate --path=/var/www/wordpress --allow-root || 
    {
        echo "Redis plugin installation failed, continuing..."
    }
    
    # proper permissions after plugin is done installing
    chown -R nobody:nobody /var/www/wordpress/wp-content
    chmod -R 755 /var/www/wordpress/wp-content
    
    wp redis enable --path=/var/www/wordpress --allow-root || 
    {
        echo "Redis plugin enable failed, continuing..."
    }
    echo "WordPress installed."
fi

# permission check final
echo "Final permission adjustment..."
chown -R nobody:nobody /var/www/wordpress
find /var/www/wordpress/ -type d -exec chmod 755 {} \;
find /var/www/wordpress/ -type f -exec chmod 644 {} \;

echo "WordPress setup complete, starting PHP-FPM..."
exec "$@"