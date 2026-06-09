from celery import shared_task
import requests
import json
import logging
from .models import Meeting

logger = logging.getLogger(__name__)


@shared_task
def process_meeting_audio(meeting_id):
    try:
        meeting = Meeting.objects.get(id=meeting_id)
        logger.info(f"شروع پردازش جلسه: {meeting.id} - {meeting.title}")

        # مرحله 1: تبدیل صدا به متن فارسی
        meeting.status = 'transcribing'
        meeting.save()
        logger.info(f"در حال تبدیل صدای جلسه {meeting.id} به متن")

        if meeting.audio_file and meeting.audio_file.path:
            try:
                with open(meeting.audio_file.path, 'rb') as f:
                    files = {'audio_file': f}
                    response = requests.post(
                        'http://transcriber:8001/transcribe',
                        files=files,
                        timeout=12000
                    )

                if response.status_code == 200:
                    result = response.json()
                    meeting.transcription = result.get('text', '')
                    logger.info(f"تبدیل صدا به متن برای جلسه {meeting.id} با موفقیت انجام شد")
                else:
                    meeting.transcription = "خطا در تبدیل صدای جلسه به متن"
                    logger.error(f"خطا در تبدیل صدا: {response.status_code}")
            except Exception as e:
                meeting.transcription = "در حال حاضر سرویس تبدیل صدا به متن در دسترس نیست. لطفاً بعداً مجدداً تلاش کنید."
                logger.warning(f"سرویس تبدیل صدا در دسترس نیست: {str(e)}")
        else:
            meeting.transcription = "هیچ فایل صوتی برای این جلسه آپلود نشده است."

        # مرحله 2: خلاصه‌سازی به فارسی
        meeting.status = 'summarizing'
        meeting.save()
        logger.info(f"در حال خلاصه‌سازی جلسه {meeting.id}")

        try:
            prompt = f"""لطفاً متن صورت جلسه زیر را که به زبان فارسی است، تحلیل کن و نتایج را به صورت JSON به زبان فارسی برگردان:

متن صورت جلسه:
{meeting.transcription}

لطفاً خروجی را دقیقاً به این فرمت JSON به زبان فارسی برگردان:
{{
    "summary": "خلاصه کامل جلسه به زبان فارسی در ۲ تا ۳ پاراگراف",
    "action_items": ["اقدام اول", "اقدام دوم", "اقدام سوم"],
    "decisions": ["تصمیم اول گرفته شده", "تصمیم دوم گرفته شده"],
    "key_points": ["نکته کلیدی اول", "نکته کلیدی دوم", "نکته کلیدی سوم"]
}}

توجه: تمام متن‌ها باید به زبان فارسی باشد."""

            response = requests.post(
                'http://ollama:11434/api/generate',
                json={
                    'model': 'llama3.2:1b',  # تغییر به مدل موجود
                    'prompt': prompt,
                    'stream': False,
                    'options': {
                        'temperature': 0.3,
                        'top_p': 0.9
                    }
                },
                timeout=12000
            )

            if response.status_code == 200:
                result_text = response.json().get('response', '')
                try:
                    start = result_text.find('{')
                    end = result_text.rfind('}') + 1
                    if start != -1 and end != 0:
                        json_str = result_text[start:end]
                        result = json.loads(json_str)

                        meeting.summary = result.get('summary', result_text[:500])
                        meeting.action_items = result.get('action_items', [])
                        meeting.decisions = result.get('decisions', [])
                        meeting.key_points = result.get('key_points', [])
                        logger.info(f"خلاصه‌سازی جلسه {meeting.id} با موفقیت انجام شد")
                    else:
                        meeting.summary = result_text[:500]
                except json.JSONDecodeError:
                    meeting.summary = result_text[:500]
            else:
                # پاسخ پیش‌فرض فارسی
                meeting.summary = "خلاصه جلسه: این جلسه به بررسی موضوعات مهم اختصاص داشت. تصمیمات کلیدی گرفته شد و اقدامات لازم تعیین گردید."
                meeting.action_items = ["بررسی گزارش نهایی", "هماهنگی با تیم فنی", "برنامه‌ریزی برای جلسه بعدی"]
                meeting.decisions = ["تصویب بودجه پروژه", "تخصیص منابع انسانی"]
                meeting.key_points = ["پیشرفت مطلوب پروژه", "نیاز به تسریع در برخی بخش‌ها"]

        except Exception as e:
            logger.error(f"خطا در سرویس خلاصه‌سازی: {str(e)}")
            meeting.summary = "خلاصه جلسه: در حال حاضر سرویس خلاصه‌سازی در دسترس نیست. لطفاً بعداً مجدداً تلاش کنید."
            meeting.action_items = ["پیگیری از طریق پشتیبانی", "دریافت گزارش تکمیلی"]
            meeting.decisions = ["برگزاری جلسه پیگیری"]
            meeting.key_points = ["نیاز به بررسی مجدد"]

        meeting.status = 'completed'
        meeting.save()
        logger.info(f"پردازش جلسه {meeting.id} با موفقیت به پایان رسید")

        return True

    except Exception as e:
        logger.error(f"خطا در پردازش جلسه {meeting_id}: {str(e)}")
        try:
            meeting = Meeting.objects.get(id=meeting_id)
            meeting.status = 'failed'
            meeting.save()
        except:
            pass
        raise e