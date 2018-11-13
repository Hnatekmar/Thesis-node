FROM node:8-alpine

COPY . .

RUN apk add python make g++

RUN yarn install

CMD ["node", "client.js"]

