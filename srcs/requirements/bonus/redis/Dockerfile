# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/05 14:28:12 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/05 16:39:57 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19

RUN apk add --no-cache redis && \
    rm -rf /var/cache/apk/* && \
    mkdir -p /data && \
    chown -R redis:redis /data && \
    chmod -R 755 /data

EXPOSE 6379

CMD ["redis-server", "--bind", "0.0.0.0", "--protected-mode", "no", "--dir", "/data"]
