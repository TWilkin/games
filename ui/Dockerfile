FROM node:13.8-stretch AS build-image

# install the application
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install --no-production
COPY . .

# transpile the application
RUN npm run build

# copy the build application into NGINX container
FROM nginx:1.17.10-alpine AS run-image
WORKDIR /usr/share/nginx/html
COPY --from=build-image /usr/src/app/*.html .
COPY --from=build-image /usr/src/app/dist/ ./dist

# start NGINX
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
