#!/bin/sh
set -e

DATA_DIR="/var/lib/mysql"

if [ ! -d "$DATA_DIR/mysql" ]; then
    echo "Initializing database..."
    mariadb-install-db --user=mysql --datadir="$DATA_DIR" || { echo "Failed to initialize database"; exit 1; }

    echo "Starting temporary database server..."
    mysqld --user=mysql --skip-networking --socket=/tmp/mysql.sock &
    pid="$!"

    echo "Waiting for database server to start..."
    for i in {1..30}; do
        if mysqladmin --socket=/tmp/mysql.sock ping >/dev/null 2>&1; then
            break
        fi
        sleep 1
    done

    if ! mysqladmin --socket=/tmp/mysql.sock ping >/dev/null 2>&1; then
        echo "Error: Database server failed to start"
        exit 1
    fi

    echo "Configuring MariaDB..."
    ROOT_PASSWORD=$(cat /run/secrets/mariadb_root_password)
    WP_PASSWORD=$(cat /run/secrets/mariadb_wp_password)

    mysql --socket=/tmp/mysql.sock <<EOF
SET @@SESSION.SQL_LOG_OFF=1;
CREATE DATABASE IF NOT EXISTS \`${WORDPRESS_DB_NAME}\`;
CREATE USER IF NOT EXISTS '${WORDPRESS_DB_USER}'@'%' IDENTIFIED BY '${WP_PASSWORD}';
CREATE USER IF NOT EXISTS '${WORDPRESS_DB_USER}'@'localhost' IDENTIFIED BY '${WP_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${WORDPRESS_DB_NAME}\`.* TO '${WORDPRESS_DB_USER}'@'%';
GRANT ALL PRIVILEGES ON \`${WORDPRESS_DB_NAME}\`.* TO '${WORDPRESS_DB_USER}'@'localhost';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '${ROOT_PASSWORD}';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${ROOT_PASSWORD}';
FLUSH PRIVILEGES;
EOF

    if [ $? -ne 0 ]; then
        echo "Error: Failed to configure database"
        exit 1
    fi

    echo "Stopping temporary database server..."
    mysqladmin --socket=/tmp/mysql.sock shutdown

    echo "Database initialized."
else
    echo "Database already initialized, skipping setup."
fi

exec "$@"
