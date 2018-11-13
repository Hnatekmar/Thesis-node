FROM node:11-alpine

RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    git

COPY clone_and_prepare.sh .
CMD sh clone_and_prepare.sh
