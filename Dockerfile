FROM node:11 as build

# Create app directory
WORKDIR /fist-of-five

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY client ./client
COPY common ./common
COPY server ./server

WORKDIR /fist-of-five/client
RUN npm install
RUN npm run build


# If you are building your code for production
# RUN npm install --only=production

