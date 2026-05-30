import os
import tempfile
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import redis
import json
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# اتصال به Redis (اختیاری)
try:
    redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
    redis_client.ping()
    logger.info("Connected to Redis")
except:
    redis_client = None
    logger.warning("Redis not available, running without cache")


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "transcriber",
        "mode": "mock"
    }


@app.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    try:
        logger.info(f"Received file: {audio_file.filename}")

        # Mock response
        return JSONResponse(content={
            "success": True,
            "text": f"متن پیاده شده برای فایل {audio_file.filename}. سرویس تبدیل صدا به متن در حال راه‌اندازی است.",
            "language": "fa",
            "segments": []
        })

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)