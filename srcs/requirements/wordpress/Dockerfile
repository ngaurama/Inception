# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/02 15:01:47 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/05 16:19:13 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19

RUN apk update && apk add --no-cache \
    php81 \
    php81-fpm \
    php81-mysqli \
    php81-xml \
    php81-mbstring \
    php81-curl \
    php81-zip \
    php81-gd \
    php81-cli \
    php81-common \
    php81-soap \
    php81-intl \
    php81-phar \
    php81-bcmath \
    php81-redis \
    php81-ctype \
    wget \
    unzip \
    curl \
    redis \
    mariadb-client && \
    ln -s /usr/bin/php81 /usr/bin/php && \
    rm -rf /var/cache/apk/*

RUN sed -i 's/listen = 127.0.0.1:9000/listen = 0.0.0.0:9000/' /etc/php81/php-fpm.d/www.conf

RUN wget https://wordpress.org/latest.tar.gz -O /tmp/wordpress.tar.gz && \
    mkdir -p /var/www/wordpress && \
    tar -xzf /tmp/wordpress.tar.gz -C /var/www/ && \
    rm /tmp/wordpress.tar.gz

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar && \
    chmod +x wp-cli.phar && \
    mv wp-cli.phar /usr/local/bin/wp

WORKDIR /var/www/wordpress

COPY tools/wp-config-setup.sh /usr/local/bin/wp-config-setup.sh
RUN chmod +x /usr/local/bin/wp-config-setup.sh

RUN mkdir -p /var/www/wordpress/wp-content/cache && \
    mkdir -p /var/www/wordpress/wp-content/uploads && \
    mkdir -p /tmp/wp-cache && \
    chown -R nobody:nobody /var/www/wordpress && \
    chown -R nobody:nobody /tmp/wp-cache && \
    find /var/www/wordpress/ -type d -exec chmod 755 {} \; && \
    find /var/www/wordpress/ -type f -exec chmod 644 {} \; && \
    chmod 755 /var/www/wordpress/wp-content/cache && \
    chmod 755 /tmp/wp-cache

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/wp-config-setup.sh"]

CMD ["/usr/sbin/php-fpm81", "-F"]
