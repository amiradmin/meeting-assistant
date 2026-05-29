from celery import shared_task
from django.core.files.base import ContentFile
from django.conf import settings
import requests
import json
import logging
from .models import Meeting

logger = logging.getLogger(__name__)


@shared_task
def process_meeting_audio(meeting_id):
    try:
        meeting = Meeting.objects.get(id=meeting_id)
        logger.info(f"Starting processing for meeting: {meeting.id} - {meeting.title}")

        # مرحله 1: تبدیل صدا به متن
        meeting.status = 'transcribing'
        meeting.save()
        logger.info(f"Transcribing meeting {meeting.id}")

        # اگر فایل صوتی وجود دارد
        if meeting.audio_file and meeting.audio_file.path:
            try:
                # تلاش برای اتصال به سرویس transcriber
                with open(meeting.audio_file.path, 'rb') as f:
                    files = {'audio_file': f}
                    response = requests.post(
                        'http://transcriber:8001/transcribe',
                        files=files,
                        timeout=300
                    )

                if response.status_code == 200:
                    result = response.json()
                    meeting.transcription = result.get('text', '')
                    logger.info(f"Transcription completed for meeting {meeting.id}")
                else:
                    meeting.transcription = "خطا در تبدیل صدا به متن"
                    logger.error(f"Transcription failed with status: {response.status_code}")
            except Exception as e:
                # اگر transcriber در دسترس نبود، از متن mock استفاده کن
                meeting.transcription = "این یک متن آزمایشی است. سرویس تبدیل صدا به متن در حال راه‌اندازی است."
                logger.warning(f"Transcriber not available: {str(e)}")
        else:
            # اگر فایل صوتی وجود نداشت، از متن نمونه استفاده کن
            meeting.transcription = "این یک جلسه نمونه است. لطفاً فایل صوتی خود را آپلود کنید."

        # مرحله 2: خلاصه‌سازی با Ollama
        meeting.status = 'summarizing'
        meeting.save()
        logger.info(f"Summarizing meeting {meeting.id}")

        try:
            prompt = f"""لطفاً متن جلسه زیر را تحلیل کن و نتایج را به صورت JSON برگردان:

متن جلسه:
{meeting.transcription}

لطفاً خروجی را دقیقاً به این فرمت JSON برگردان:
{{
    "summary": "خلاصه کلی جلسه در ۲-۳ پاراگراف",
    "action_items": ["اقدام ۱", "اقدام ۲", "اقدام ۳"],
    "decisions": ["تصمیم ۱", "تصمیم ۲"],
    "key_points": ["نکته کلیدی ۱", "نکته کلیدی ۲", "نکته کلیدی ۳"]
}}
"""

            response = requests.post(
                'http://ollama:11434/api/generate',
                json={
                    'model': 'llama3.2:3b',
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.3,
                        'top_p': 0.9
                    }
                },
                timeout=300
            )

            if response.status_code == 200:
                result_text = response.json().get('response', '')
                # استخراج JSON از پاسخ
                try:
                    # پیدا کردن JSON در متن
                    start = result_text.find('{')
                    end = result_text.rfind('}') + 1
                    if start != -1 and end != 0:
                        json_str = result_text[start:end]
                        result = json.loads(json_str)

                        meeting.summary = result.get('summary', '')
                        meeting.action_items = result.get('action_items', [])
                        meeting.decisions = result.get('decisions', [])
                        meeting.key_points = result.get('key_points', [])
                    else:
                        meeting.summary = result_text[:500]
                except json.JSONDecodeError:
                    meeting.summary = result_text[:500]
            else:
                meeting.summary = "خلاصه‌سازی در حال حاضر در دسترس نیست."

        except Exception as e:
            meeting.summary = "خطا در ارتباط با سرویس خلاصه‌سازی."
            logger.error(f"Ollama error: {str(e)}")

        meeting.status = 'completed'
        meeting.save()
        logger.info(f"Meeting {meeting.id} processing completed")

        return True

    except Exception as e:
        logger.error(f"Error processing meeting {meeting_id}: {str(e)}")
        try:
            meeting = Meeting.objects.get(id=meeting_id)
            meeting.status = 'failed'
            meeting.save()
        except:
            pass
        raise e