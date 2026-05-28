#FROM node:18-alpine
FROM node:20-alpine

WORKDIR /app

# کپی فایل‌های package
COPY package*.json ./

# نصب وابستگی‌ها
RUN npm install --legacy-peer-deps

# کپی بقیه فایل‌های پروژه
COPY . .

# expose پورت Vite (پیش‌فرض 5173 است، اما شما در compose پورت 3000 را تنظیم کرده‌اید)
EXPOSE 3000

# اجرای Vite در حالت development با پورت مشخص
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]