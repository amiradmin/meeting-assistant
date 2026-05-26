FROM python:3.11-slim

WORKDIR /app

# نصب dependencies سیستم
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# کپی و نصب Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# کپی سورس کد
COPY . .

# ایجاد پوشه برای فایل‌های آپلودی
RUN mkdir -p /app/uploads /app/models

# پورت سرویس
EXPOSE 8001

# اجرای FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]