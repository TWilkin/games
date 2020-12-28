FROM node:14.15-alpine AS build-image

# tools for building SQLite
RUN apk add --no-cache g++ make python

# install the application
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install --no-production
COPY . .

# run the tests, then clean up
RUN npm test \
    && npm prune --production \
    && rm -r ./test ./config/test.json

# start the node application
FROM node:14.15-alpine AS run-image
WORKDIR /usr/src/app
COPY --from=build-image /usr/src/app .
CMD npm start
