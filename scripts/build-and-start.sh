
#!/bin/bash

## Make language executables. Not in Dockerfile because it is a read-only filesystem
## See: https://stackoverflow.com/questions/56045077/dockerfile-run-chmod-not-taking-effect
chmod --recursive +x ./langs/

## Build docker image
echo "Building image..."
BUILD_ID=$(sudo docker build -q .)
echo "Built with ID ${BUILD_ID}"

## Run image
echo "Running image in container..."
sudo docker run -d -v /var/run/docker.sock:/var/run/docker.sock -p 80:80 --name "sixtyseconds-container" "${BUILD_ID}"