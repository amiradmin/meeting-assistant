FROM python:3.12-slim

WORKDIR /app

RUN sed -i 's|deb.debian.org|linux-mirror.liara.ir/repository|g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's|security.debian.org|linux-mirror.liara.ir/repository-security|g' /etc/apt/sources.list.d/debian.sources
# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .



# Install Python packages
RUN pip install --no-cache-dir \
    -i https://package-mirror.liara.ir/repository/pypi/simple/ \
    --trusted-host package-mirror.liara.ir \
    --upgrade pip
RUN  pip install --no-cache-dir \
    --timeout 300 \
    --retries 5 \
    -i https://mirrors.aliyun.com/pypi/simple/  \
    --trusted-host https://mirrors.aliyun.com \
    -r requirements.txt

# Copy application
COPY main.py .

EXPOSE 8001

# Run with python directly
CMD ["python", "-u", "main.py"]