# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/05 21:35:29 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/13 17:56:28 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.18 AS builder

RUN apk add --no-cache nodejs npm

WORKDIR /app

COPY Portfolio/package*.json ./

RUN npm install

COPY Portfolio/ .

RUN npm run build

FROM alpine:3.18

RUN apk add --no-cache rsync

WORKDIR /app

COPY --from=builder /app/dist /app/dist

CMD ["rsync", "-av", "/app/dist/", "/var/www/portfolio"]
