# user the offical nodejs 18 image with aloine linux as the base image
FROM node:18-alpine

WORKDIR /use/src/app

COPY  package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD [ "node","src/server.js" ]