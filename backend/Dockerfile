# مرحله 1: Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# نصب dependencies سیستم مورد نیاز
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# کپی و نصب Python packages
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# مرحله 2: Final stage
FROM python:3.11-slim

WORKDIR /app

# کپی پکیج‌های نصب شده از مرحله builder
COPY --from=builder /root/.local /root/.local

# نصب dependencies سیستم مورد نیاز در زمان اجرا
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# به روز رسانی PATH
ENV PATH=/root/.local/bin:$PATH

# کپی سورس کد
COPY . .

# ایجاد پوشه‌های مورد نیاز
RUN mkdir -p /app/staticfiles /app/media /app/uploads

# پورت سرویس
EXPOSE 8000

# کاربر غیر root برای امنیت بیشتر
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# اجرای Django (در production از gunicorn استفاده می‌کنیم)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]