#!/usr/bin/env bash

set -ex

GIT_REF=$(git rev-parse --abbrev-ref HEAD)
GIT_COMMIT=$(git rev-parse HEAD)

GIT_TAG="${GIT_REF}-${GIT_COMMIT}"
IMAGE_TAG=${IMAGE_TAG:-$GIT_TAG}

docker build -f Dockerfile -t esiqveland/raskruteoversikt:$IMAGE_TAG .

docker push esiqveland/raskruteoversikt:$IMAGE_TAG
