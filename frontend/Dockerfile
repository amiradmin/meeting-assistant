# مرحله 1: Build stage
FROM node:18-alpine as builder

WORKDIR /app

# کپی package.json ها
COPY package*.json ./
COPY yarn.lock* ./

# نصب dependencies
RUN npm ci --only=production --silent || npm install --silent

# کپی سورس کد
COPY . .

# بیلد کردن اپلیکیشن React
RUN npm run build

# مرحله 2: Production stage با Nginx
FROM nginx:alpine

# نصب curl برای healthcheck
RUN apk add --no-cache curl

# کپی فایل build شده از مرحله builder
COPY --from=builder /app/build /usr/share/nginx/html

# کپی کانفیگ سفارشی Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# کپی اسکریپت entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# پورت سرویس
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]