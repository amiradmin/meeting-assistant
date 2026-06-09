#!/usr/bin/env python3
# transcriber/main.py

import os
import logging
import signal
import sys
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
import redis
import whisper
import tempfile
import subprocess

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(title="Meeting Transcriber Service", version="1.0")

# Initialize Redis
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'redis'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Connected to Redis")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}")
    redis_client = None

# Load Whisper model
MODEL_SIZE = os.getenv('MODEL_SIZE', 'medium')
MODEL_TYPE = os.getenv('MODEL_TYPE', 'persian-large')
logger.info(f"Loading model: {MODEL_TYPE if MODEL_TYPE != 'persian-large' else MODEL_SIZE}")

try:
    # Try to load Persian model if specified
    if MODEL_TYPE == 'persian-large':
        # For Persian specialized model, use whisper directly with medium
        model = whisper.load_model("medium")
    else:
        model = whisper.load_model(MODEL_SIZE)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    model = None


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse({
        "status": "ok",
        "service": "transcriber",
        "model_loaded": model is not None,
        "redis_connected": redis_client is not None and redis_client.ping() if redis_client else False
    })


@app.post("/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    """Transcribe audio file"""
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    logger.info(f"Received transcription request: {audio.filename}")

    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
        content = await audio.read()
        tmp_file.write(content)
        tmp_path = tmp_file.name

    try:
        # Convert to wav if needed
        if not audio.filename.endswith('.wav'):
            wav_path = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
            result = subprocess.run([
                'ffmpeg', '-i', tmp_path, '-acodec', 'pcm_s16le', '-ar', '16000',
                '-ac', '1', wav_path, '-y'
            ], check=True, capture_output=True)
            os.unlink(tmp_path)
            tmp_path = wav_path

        # Transcribe
        result = model.transcribe(tmp_path, language="fa", task="transcribe")

        logger.info(f"Transcription completed: {len(result['text'])} characters")

        return JSONResponse({
            "success": True,
            "text": result["text"],
            "language": "fa",
            "segments": result.get("segments", [])
        })
    except Exception as e:
        logger.error(f"Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.get("/")
async def root():
    return {"message": "Meeting Transcriber Service", "endpoints": ["/health", "/transcribe"]}


def signal_handler(sig, frame):
    logger.info("Shutting down gracefully...")
    sys.exit(0)


if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    logger.info("=" * 50)
    logger.info("Starting transcriber server on 0.0.0.0:8001")
    logger.info("=" * 50)

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info",
        access_log=True
    )