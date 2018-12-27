FROM node:8-alpine

WORKDIR /src

RUN apk add python make g++

RUN yarn install

CMD ["node", "--max_old_space_size=8192", "client.js"]

