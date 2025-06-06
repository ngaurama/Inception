# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Dockerfile                                         :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/06/05 18:56:57 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/05 21:29:22 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

FROM alpine:3.19

RUN apk add --no-cache curl tini && \
    rm -rf /var/cache/apk/*

ENV PORTAINER_VERSION=2.22.0

RUN curl -L https://github.com/portainer/portainer/releases/download/${PORTAINER_VERSION}/portainer-${PORTAINER_VERSION}-linux-amd64.tar.gz -o /tmp/portainer.tar.gz && \
    tar -xzf /tmp/portainer.tar.gz -C /usr/local/ && \
    rm /tmp/portainer.tar.gz && \
    chmod +x /usr/local/portainer/portainer && \
    mkdir -p /data

EXPOSE 9000

WORKDIR /usr/local/portainer

ENTRYPOINT ["/sbin/tini", "--", "/usr/local/portainer/portainer", "--data", "/data", "--admin-password-file", "/run/secrets/portainer_admin_password", "--host", "unix:///var/run/docker.sock"]
