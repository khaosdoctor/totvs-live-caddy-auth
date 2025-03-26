# Esse arquivo é somente um arquivo de exemplo
# idealmente você não faria assim em produção 
FROM node:23-alpine
USER node
WORKDIR /app

COPY package.json package-lock.json /app/
COPY src/ /app/src
ARG AUTH_SERVICE_URL='http://auth:4052'
ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL}

RUN npm ci
EXPOSE 3000
ENTRYPOINT node --experimental-transform-types ./src/index.ts
