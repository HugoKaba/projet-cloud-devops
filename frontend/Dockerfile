FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

ENV BACKEND_HOST=localhost
ENV BACKEND_PORT=3001

RUN apk add --no-cache curl

COPY --from=builder /app/build /usr/share/nginx/html

COPY default.conf.template /etc/nginx/templates/default.conf.template

RUN echo '#!/bin/sh' > /usr/local/bin/health-check.sh && \
    echo 'curl -f http://localhost/api/health || exit 1' >> /usr/local/bin/health-check.sh && \
    chmod +x /usr/local/bin/health-check.sh

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/health-check.sh

CMD ["/bin/sh", "-c", "envsubst '\\$BACKEND_HOST \\$BACKEND_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]

EXPOSE 80
