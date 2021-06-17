
#!/bin/bash

## Build docker image
echo "Building image..."
BUILD_ID=$(sudo docker build -q .)
echo "Built with ID ${BUILD_ID}"

## Run image
echo "Running image in container..."
$(sudo docker run -d -v /var/run/docker.sock:/var/run/docker.sock -p 80:80 "${BUILD_ID}")