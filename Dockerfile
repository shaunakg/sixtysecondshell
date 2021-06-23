# Use the official lightweight Node.js 14 image.
# https://hub.docker.com/_/node
FROM alpine

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install nodejs, npm, python3, build-base and docker as dependencies for our program
# NodeJS - Runs the actual server
# NPM - for dependencies that the server needs
# python3 - Required for node-tty, won't be exposed to the user.
# build-base - Required for node-tty
# docker - hosts the containers
# iptables - control access to sensitive data
RUN apk add nodejs npm python3 docker build-base iptables jq

# Disable access to EC2 instance metadata
# Currently broken - temp. solution is to disable container network access 
# RUN iptables -t nat -I PREROUTING -p tcp -d 169.254.169.254 --dport 80 -j DNAT --to-destination 1.1.1.1

# Install production dependencies.
# If you add a package-lock.json, speed your build by switching to 'npm ci'.
# RUN npm ci --only=production
RUN npm install --only=production

# # Make language files executable for node-pty
# RUN chmod +x ./langs/*.sh

# Copy local code to the container image.
COPY . ./

# Run the web service on container startup.
ENV PORT=$PORT
CMD [ "node", "server.js" ]