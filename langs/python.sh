#!/usr/bin/env bash

## This will run a docker container with the Python image and use stdout
## It only consists of one command but must be its own file because otherwise we couldn't spawn a PTY from node-pty

docker run -it python python