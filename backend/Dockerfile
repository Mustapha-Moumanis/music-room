FROM node:22-alpine

RUN apk add --no-cache openssl
WORKDIR /code
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]
