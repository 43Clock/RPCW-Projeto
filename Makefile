build-and-compose: build compose

build: login app api auth

compose:
	sudo docker-compose build
	sudo docker-compose up -d

compose-logs:
	sudo docker-compose logs
	
compose-down:
	sudo docker-compose down

login:
	sudo docker login

app:
	cd app-server; sudo docker build ./ -t zecosta109/app-server:latest; sudo docker push zecosta109/app-server:latest

api:
	cd api-server; sudo docker build ./ -t zecosta109/api-server:latest; sudo docker push zecosta109/api-server:latest

auth:
	cd auth-server; sudo docker build ./ -t zecosta109/auth-server:latest; sudo docker push zecosta109/auth-server:latest

    