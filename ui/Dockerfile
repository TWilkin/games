FROM node:14.15-alpine AS build-image

# install the application
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install --no-production
COPY . .

# transpile the application
RUN npm run build

# copy the built application into NGINX container
FROM nginx:1.17.10-alpine AS run-image
WORKDIR /usr/share/nginx/html
COPY --from=build-image /usr/src/app/public/ .
COPY --from=build-image /usr/src/app/dist/ .

# copy the NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# start NGINX
EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
