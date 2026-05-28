# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies including Celery
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Create necessary directories
RUN mkdir -p /app/staticfiles /app/media

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]