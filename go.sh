#!/bin/bash

echo Resetting git repo and pulling new files...
sh ./scripts/pull.sh

echo Building and starting container...
sh ./scripts/build-and-start.sh