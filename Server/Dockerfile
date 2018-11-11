FROM node:11-alpine

RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    git

COPY . .
RUN yarn install

CMD node server.js
