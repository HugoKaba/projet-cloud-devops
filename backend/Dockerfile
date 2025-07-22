FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm cache clean --force

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

COPY . .

RUN chown -R nodeuser:nodejs /app
USER nodeuser

ENV NODE_ENV=production
ENV AWS_REGION=eu-west-1
ENV PORT=3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

EXPOSE 3001

CMD ["npm", "start"]
