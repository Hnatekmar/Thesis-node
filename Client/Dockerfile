FROM node:8-alpine

COPY . .

VOLUME /data

RUN apk add python make g++

RUN yarn install

CMD ["node", "client.js"]

