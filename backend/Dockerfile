FROM node:22-alpine

RUN apk add --no-cache openssl
WORKDIR /code
COPY package*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN chmod +x docker-entrypoint.sh && npx prisma generate
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:dev"]
