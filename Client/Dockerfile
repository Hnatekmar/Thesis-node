FROM node:8-alpine

RUN apk add python make g++

COPY . .

RUN yarn install

CMD ["node", "client.js"]

