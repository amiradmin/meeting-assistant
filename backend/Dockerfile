FROM python:3.11-slim

WORKDIR /app

RUN sed -i 's|deb.debian.org|linux-mirror.liara.ir/repository|g' /etc/apt/sources.list.d/debian.sources && \
    sed -i 's|security.debian.org|linux-mirror.liara.ir/repository-security|g' /etc/apt/sources.list.d/debian.sources


RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    libmagic1 \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
#RUN pip install --no-cache-dir --upgrade setuptools wheel
RUN pip install --no-cache-dir --timeout 900  -i https://mirrors.aliyun.com/pypi/simple/ -r requirements.txt

COPY . .

RUN mkdir -p /app/staticfiles /app/media /app/uploads

EXPOSE 8000

# Script entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]