# **************************************************************************** #
#                                                                              #
#                                                         :::      ::::::::    #
#    Makefile                                           :+:      :+:    :+:    #
#                                                     +:+ +:+         +:+      #
#    By: ngaurama <ngaurama@student.42.fr>          +#+  +:+       +#+         #
#                                                 +#+#+#+#+#+   +#+            #
#    Created: 2025/05/31 19:55:17 by ngaurama          #+#    #+#              #
#    Updated: 2025/06/06 10:45:23 by ngaurama         ###   ########.fr        #
#                                                                              #
# **************************************************************************** #

DOCKER_COMPOSE = docker-compose -f ./srcs/docker-compose.yml
ENV_FILE = ./srcs/.env
DATA_DIR = $(HOME)/data

all: setup up

setup:
	@mkdir -p $(DATA_DIR)/wordpress $(DATA_DIR)/database $(DATA_DIR)/redis $(DATA_DIR)/portainer
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

help:
	@echo "Makefile commands:"
	@echo "  make all      - Set up and start containers"
	@echo "  make setup    - Create data directories and configure hosts"
	@echo "  make up       - Build and start containers"
	@echo "  make down     - Stop containers"
	@echo "  make restart  - Restart containers"
	@echo "  make logs     - Tail container logs"
	@echo "  make clean    - Remove containers, volumes, networks, and data"
	@echo "  make re       - Clean and restart"
	@echo "  make help     - Show this help"

.PHONY: all setup up down restart logs clean re help

#openssl s_client -connect localhost:443 -tls1_2 to test TLS working or not on correct
