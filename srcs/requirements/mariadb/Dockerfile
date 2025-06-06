# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/03 13:16:35 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/05 19:40:06 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19

RUN apk update && apk add --no-cache mariadb mariadb-client && \
    rm -rf /var/cache/apk/*

RUN mkdir -p /var/lib/mysql /run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /run/mysqld && \
    chmod -R 755 /var/lib/mysql /run/mysqld

COPY tools/mariadb-setup.sh /usr/local/bin/mariadb-setup.sh
RUN chmod +x /usr/local/bin/mariadb-setup.sh

EXPOSE 3306

ENTRYPOINT ["/usr/local/bin/mariadb-setup.sh"]

CMD ["/usr/bin/mysqld", "--user=mysql", "--skip-networking=0"]