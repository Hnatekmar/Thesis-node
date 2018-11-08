#!/usr/bin/env bash

echo Building hnatekmar/server:$(uname -m)
docker build -t hnatekmar/server:$(uname -m) .
docker push hnatekmar/server:$(uname -m)
