FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 7860

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=7860

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force

COPY . .

RUN npm run build

RUN mkdir -p /data

ENV DATABASE_URL="file:/data/production.sqlite"

CMD ["npm", "run", "docker-start"]
