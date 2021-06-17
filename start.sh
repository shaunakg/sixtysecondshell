
#!/bin/bash

## Build docker image
BUILD_ID = $(sudo docker build .)

## Run image
sudo docker run -d -v /var/run/docker.sock:/var/run/docker.sock -p 80:80 "${BUILD_ID}"