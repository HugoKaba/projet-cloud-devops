FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3001

ENV NODE_ENV=production
ENV AWS_REGION=eu-west-1

CMD ["npm", "start"]
