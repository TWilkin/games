FROM node:13.8-alpine

LABEL maintainer="tom@twilkin.uk", description="Game browser and time API"

# install the dependencies
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

# copy across the application code
COPY . .

# start the node application
CMD npm start
