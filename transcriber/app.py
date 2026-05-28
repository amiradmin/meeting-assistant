import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import whisper
import redis
import json
import logging

# تنظیم logging
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

# بارگذاری مدل Whisper
model_size = os.environ.get('MODEL_SIZE', 'base')
logger.info(f"Loading Whisper model: {model_size}")
model = whisper.load_model(model_size)
logger.info("Model loaded successfully")


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "transcriber", "model": model_size}


@app.post("/transcribe")
async def transcribe_audio(audio_file: UploadFile = File(...)):
    temp_file = None
    try:
        logger.info(f"Received file: {audio_file.filename}")

        # ذخیره موقت فایل
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            temp_path = tmp_file.name
            logger.info(f"Saved temp file: {temp_path}")

        # تبدیل صدا به متن
        logger.info("Starting transcription...")
        result = model.transcribe(temp_path, language="fa", task="transcribe")
        logger.info("Transcription completed")

        # پاک کردن فایل موقت
        os.unlink(temp_path)

        return JSONResponse(content={
            "success": True,
            "text": result["text"],
            "language": result["language"],
            "segments": result.get("segments", [])
        })

    except Exception as e:
        logger.error(f"Error in transcription: {str(e)}")
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/transcribe/async")
async def transcribe_async(audio_file: UploadFile = File(...), task_id: str = None):
    temp_file = None
    try:
        # ذخیره موقت فایل
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            temp_path = tmp_file.name

        # تبدیل صدا به متن
        result = model.transcribe(temp_path, language="fa", task="transcribe")

        # پاک کردن فایل موقت
        os.unlink(temp_path)

        # ذخیره در Redis اگه task_id داده شده و Redis موجود باشد
        if task_id and redis_client:
            redis_client.setex(f"transcription:{task_id}", 3600, json.dumps(result, ensure_ascii=False))

        return JSONResponse(content={
            "success": True,
            "text": result["text"],
            "language": result["language"]
        })

    except Exception as e:
        logger.error(f"Error in async transcription: {str(e)}")
        if temp_file and os.path.exists(temp_file.name):
            os.unlink(temp_file.name)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/transcribe/status/{task_id}")
async def get_transcription_status(task_id: str):
    if not redis_client:
        return JSONResponse(content={"status": "error", "message": "Redis not available"})

    result = redis_client.get(f"transcription:{task_id}")
    if result:
        return JSONResponse(content=json.loads(result))
    return JSONResponse(content={"status": "processing"})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)