# Esse arquivo é somente um arquivo de exemplo
# idealmente você não faria assim em produção 
FROM node:23-alpine
USER node
WORKDIR /app

COPY package.json package-lock.json /app/
COPY src/ /app/src


RUN npm ci
EXPOSE 4052
ENTRYPOINT node --experimental-transform-types ./src/index.ts
