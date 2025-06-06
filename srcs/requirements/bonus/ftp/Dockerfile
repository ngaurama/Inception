# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/05 16:40:52 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/05 17:03:26 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19

RUN apk add --no-cache \
    vsftpd \
    openssl \
    && rm -rf /var/cache/apk/*

RUN mkdir -p /var/www/wordpress /var/log/vsftpd \
    && chown nobody:nobody /var/www/wordpress \
    && chmod 755 /var/www/wordpress

COPY conf/vsftpd.conf /etc/vsftpd/vsftpd.conf

COPY tools/setup-ftp.sh /usr/local/bin/setup-ftp.sh
RUN chmod +x /usr/local/bin/setup-ftp.sh

EXPOSE 21 21100-21110

CMD ["/usr/local/bin/setup-ftp.sh"]
