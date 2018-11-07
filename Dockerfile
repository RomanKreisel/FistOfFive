FROM node:10-alpine as build

WORKDIR /fist-of-five

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

FROM node:10-alpine
WORKDIR /
RUN mkdir -p /fist-of-five
COPY --from=build /fist-of-five/server /fist-of-five
WORKDIR /fist-of-five
RUN npm install --only=prod
CMD npm run run

EXPOSE 8999
