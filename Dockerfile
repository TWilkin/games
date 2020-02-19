FROM node:13.8-alpine AS build-image

# install the application
WORKDIR /usr/src/app
COPY . .
RUN npm install --no-production

# run the tests, then clean up
RUN npm test \
    && npm prune --production \
    && rm -r ./test

# start the node application
FROM node:13.8-alpine AS run-image
WORKDIR /usr/src/app
COPY --from=build-image /usr/src/app .
CMD npm start
