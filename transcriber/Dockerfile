FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    libsndfile1 \
    wget \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# آپدیت pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# ایجاد پوشه برای دانلود
RUN mkdir -p /tmp/packages

# دانلود torch با آدرس صحیح
RUN wget -c -P /tmp/packages \
    https://download.pytorch.org/whl/cpu/torch-2.1.2%2Bcpu-cp310-cp310-linux_x86_64.whl || \
    wget -c -P /tmp/packages \
    https://files.pythonhosted.org/packages/ce/65/7c7e3ad48467ba8a70f5f41fc83a65e66b2fade089a7ce6e93d7ec3975ba/torch-2.1.2-cp310-cp310-manylinux_2_28_x86_64.whl

# دانلود torchaudio
RUN wget -c -P /tmp/packages \
    https://download.pytorch.org/whl/cpu/torchaudio-2.1.2%2Bcpu-cp310-cp310-linux_x86_64.whl || \
    wget -c -P /tmp/packages \
    https://files.pythonhosted.org/packages/68/c4/3a44a5bceb18c8820e873ebdcdb8933a9f3bb660479b1552fa860673c5b5/torchaudio-2.1.2-cp310-cp310-manylinux_2_28_x86_64.whl

# نصب از فایل‌های محلی (اگر دانلود شده باشد)
RUN pip install --no-cache-dir /tmp/packages/*.whl || true

# نصب بقیه پکیج‌ها
RUN pip install --no-cache-dir \
    --retries=10 \
    --timeout=600 \
    fastapi \
    uvicorn[standard] \
    redis \
    python-multipart \
    numpy \
    tqdm \
    more-itertools \
    transformers \
    openai-whisper

COPY main.py .

RUN mkdir -p /app/uploads

EXPOSE 8001

CMD ["python", "main.py"]