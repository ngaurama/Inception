# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/05 17:57:39 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/05 17:57:49 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19

RUN apk add --no-cache \
    php \
    php-mysqli \
    php-session \
    php-json \
    php-iconv \
    php-mbstring \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /var/www/adminer \
    && wget -O /var/www/adminer/index.php https://github.com/vrana/adminer/releases/download/v4.8.1/adminer-4.8.1.php \
    && chown -R nobody:nobody /var/www/adminer \
    && chmod -R 755 /var/www/adminer

EXPOSE 8080

CMD ["php", "-S", "0.0.0.0:8080", "-t", "/var/www/adminer"]
