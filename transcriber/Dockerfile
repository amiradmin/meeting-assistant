# transcriber/Dockerfile
FROM ubuntu:22.04

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3.11 \
    python3-pip \
    gcc \
    g++ \
    ffmpeg \
    curl \
    libsndfile1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Create symbolic link for python3
RUN ln -s /usr/bin/python3.11 /usr/bin/python

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies (using default PyPI)
RUN pip install --no-cache-dir --timeout 600 -r requirements.txt

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 8001

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

CMD ["python3", "main.py"]