# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/05/31 19:55:17 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/13 18:01:21 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

DOCKER_COMPOSE = docker-compose -f ./srcs/docker-compose.yml
ENV_FILE = ./srcs/.env
DATA_DIR = $(HOME)/data

all: setup up

setup:
	@mkdir -p $(DATA_DIR)/wordpress $(DATA_DIR)/database $(DATA_DIR)/redis $(DATA_DIR)/portainer $(DATA_DIR)/static
	@sudo chown -R $(USER):$(USER) $(DATA_DIR)
	@chmod -R 755 $(DATA_DIR)

up:
	@echo "Starting WordPress stack..."
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) up -d --build

down:
	@echo "Stopping WordPress stack..."
	$(DOCKER_COMPOSE) down

restart: down up

logs:
	$(DOCKER_COMPOSE) logs

clean:
	@echo "Cleaning up volumes, containers, and networks..."
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) down -v --remove-orphans --rmi all
	@sudo chown -R $(USER):$(USER) $(DATA_DIR) 2>/dev/null || true
	@rm -rf $(DATA_DIR)

re: clean all

.PHONY: all setup up down restart logs clean re

#openssl s_client -connect localhost:443 -tls1_2 to test TLS working or not on correct
