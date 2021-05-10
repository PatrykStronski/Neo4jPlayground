from node:16-slim

WORKDIR /app

COPY package.json package.json

RUN yarn install
EXPOSE 3000
RUN yarn start
