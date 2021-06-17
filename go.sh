#!/bin/bash

echo Resetting git repo and pulling new files...
sh ./pull.sh

echo Building and starting container...
sh ./build-and-start.sh