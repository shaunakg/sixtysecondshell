
#!/bin/bash

## Build docker image
BUILD_ID = $(sudo docker build .)

## Run image
sudo docker run -d \ # In detached mode
                -v /var/run/docker.sock:/var/run/docker.sock \ # Allow the image to have access to the docker on our machine
                -p 80:80 # Forward HTTP port 80 on the container to our port 80
                "${BUILD_ID}" # Use the build we made before.