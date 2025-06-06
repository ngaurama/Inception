#!/bin/sh
set -e

FTP_USER=${FTP_USER:-ftpuser}
WORDPRESS_PATH=/var/www/wordpress

if [ -f /run/secrets/FTP_PASSWORD ]; then
    FTP_PASSWORD=$(cat /run/secrets/FTP_PASSWORD)
else
    echo "Error: FTP_PASSWORD secret not found"
    exit 1
fi

if ! id "$FTP_USER" >/dev/null 2>&1; then
    echo "Creating FTP user: $FTP_USER"
    adduser -D -h "$WORDPRESS_PATH" -s /bin/false "$FTP_USER"
    echo "$FTP_USER:$FTP_PASSWORD" | chpasswd
else
    echo "FTP user $FTP_USER already exists"
fi

echo "$FTP_USER" > /etc/vsftpd/userlist

chown -R "$FTP_USER":"$FTP_USER" "$WORDPRESS_PATH"
chmod -R 755 "$WORDPRESS_PATH"

touch /var/log/vsftpd/vsftpd.log
chown nobody:nobody /var/log/vsftpd/vsftpd.log

echo "Starting vsftpd..."
exec /usr/sbin/vsftpd /etc/vsftpd/vsftpd.conf