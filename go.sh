#!/bin/bash

echo Resetting git repo and pulling new files...
sh ./scripts/pull.sh

echo Stopping running containers...
sh ./scripts/stop.sh

echo Building and starting container...
sh ./scripts/build-and-start.sh