#!/bin/bash

if [ -z "$REGISTRY" ]
then
    echo "Expects variable REGISTRY to be set, please set variable with 'export REGISTRY=myregistry.home:5000'"
    exit 1
fi
echo "Using registry [$REGISTRY]"

# create the buildx.toml file
echo -e "[registry.\"$REGISTRY\"]\n\tmirrors = [\"$REGISTRY\"]\n\thttp = true\n\tinsecure = true" > ./buildx.toml

# configure the buildx environment
if [ ! "$(docker ps -a | grep buildx_buildkit_games)" ]
then
    export DOCKER_CLI_EXPERIMENTAL=enabled
    docker run --rm --privileged docker/binfmt:a7996909642ee92942dcd6cff44b9b95f08dad64
    docker buildx rm games
    docker buildx create --name games --config ./buildx.toml
    docker buildx use games
    docker buildx inspect --bootstrap
fi

# build the API
echo "Building API"
cd api
docker buildx build --platform linux/amd64,linux/arm/v7 --push -t $REGISTRY/games/api:0.0.3 .
cd ..
echo "Done"

# build the UI
echo "Building UI"
cd ui
docker buildx build --platform linux/amd64,linux/arm/v7 --push -t $REGISTRY/games/ui:0.0.2 .
cd ..
echo "Done"
