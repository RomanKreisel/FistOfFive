FROM node:11 as build

# Create app directory
WORKDIR /fist-of-five

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY client ./client
COPY common ./common
COPY server ./server

WORKDIR /fist-of-five/server
RUN npm install
RUN npm run build

WORKDIR /fist-of-five/client
RUN npm install
RUN npm run build:prod

RUN mkdir -p /fist-of-five/client/dist/fist-of-five /fist-of-five/server/dist/client
RUN cp -a /fist-of-five/client/dist/fist-of-five/* /fist-of-five/server/dist/client

WORKDIR /fist-of-five/server
CMD npm run run

EXPOSE 8999