FROM node:8-alpine

WORKDIR /src

RUN apk add python make g++

RUN yarn install

CMD ["node", "client.js"]

