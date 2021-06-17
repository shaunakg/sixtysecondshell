
#!/bin/bash

## Build docker image
BUILD_ID = $(sudo docker build .)

## Run image
sudo docker run -d \ # In detached mode
                # Allow the image to have access to the docker on our machine
                -v /var/run/docker.sock:/var/run/docker.sock \
                # Forward HTTP port 80 on the container to our port 80
                -p 80:80 \
                # Use the build we made before.
                "${BUILD_ID}"