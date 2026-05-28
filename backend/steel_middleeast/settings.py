import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
# بارگذاری متغیرهای محیطی
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# امنیت
SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-default-key-change-this')
DEBUG = os.getenv('DEBUG', '1') == '1'
ALLOWED_HOSTS = ['*']

# اپلیکیشن‌های نصب شده
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_yasg',
    'guardian',
    # Local apps
    'accounts',
    'lf',
    'production',
    'eaf',
    'plc_communication',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'steel_middleeast.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'steel_middleeast.wsgi.application'

# Database - PostgreSQL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'steel_db'),
        'USER': os.getenv('DB_USER', 'steel_user'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'steel_pass_123'),
        'HOST': os.getenv('DB_HOST', 'db'),
        'PORT': os.getenv('DB_PORT', '5432'),
        'OPTIONS': {
            'client_encoding': 'UTF8',
        },
    }
}

# اعتبارسنجی رمز عبور
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# بین‌المللی سازی
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Tehran'  # تنظیم زمان ایران
USE_I18N = True
USE_TZ = True


STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# CORS settings
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
# Disable CSRF for API views (use with caution)
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]


CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# ============================================
# DJANGO REST FRAMEWORK (DRF) SETTINGS
# ============================================

REST_FRAMEWORK = {
    # Authentication
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),

    # Permissions
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

    # Pagination
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,

    # Filtering
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),

    # Throttling (Rate limiting)
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'login': '5/minute',
    },

    # Schema and documentation
    'DEFAULT_SCHEMA_CLASS': 'rest_framework.schemas.coreapi.AutoSchema',

    # Renderers
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',  # Nice web interface
    ),

    # Parser
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ),

    # Exception handling
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',

    # Date and time format
    'DATETIME_FORMAT': '%Y-%m-%d %H:%M:%S',
    'DATE_FORMAT': '%Y-%m-%d',

    # Testing
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}

# DRF YASG (Swagger) Settings
SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Bearer': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header',
            'description': 'JWT Token (Bearer your_token_here)'
        }
    },
    'USE_SESSION_AUTH': False,
    'JSON_EDITOR': True,
    'SUPPORTED_SUBMIT_METHODS': [
        'get',
        'post',
        'put',
        'delete',
        'patch'
    ],
}

AUTH_USER_MODEL = 'accounts.User'


CSRF_COOKIE_SECURE = False
CSRF_COOKIE_HTTPONLY = False
CSRF_USE_SESSIONS = False

# ============================================
# PLC COMMUNICATION CONFIGURATION
# ============================================

# 1. S7 BUS Connection (Direct to CP 443-1)
PLC_S7_CONFIG = {
    'enabled': True,
    'ip': '192.168.0.1',  # Your CP 443-1 IP address
    'rack': 0,  # Standard for S7-400
    'slot': 3,  # CPU slot for S7-400
    'timeout': 5,
}

# 2. CP 443-1 OPC UA Server (Built-in OPC UA on CP)
# Enable OPC UA server on CP 443-1 via TIA Portal/Step7 first [citation:2]
PLC_CP_OPCUA_CONFIG = {
    'enabled': False,  # Set to True after enabling OPC UA on CP
    'endpoint_url': 'opc.tcp://192.168.0.1:4840',  # Default OPC UA port
    'username': None,  # If authentication is enabled
    'password': None,
}

# 3. External OPC UA Server (Third-party OPC UA servers)
PLC_EXTERNAL_OPCUA_CONFIG = {
    'enabled': False,
    'endpoint_url': 'opc.tcp://192.168.1.100:4840',
    'username': None,
    'password': None,
}

# Tag mappings for easy reference [citation:9]
PLC_TAG_MAPPINGS = {
    # S7 Protocol addresses (S7 BUS)
    'temperature': {'type': 's7_bus', 'address': 'DB10.REAL0'},
    'pressure': {'type': 's7_bus', 'address': 'DB10.REAL4'},
    'motor_speed': {'type': 's7_bus', 'address': 'DB10.INT8'},
    'valve_position': {'type': 's7_bus', 'address': 'DB10.REAL12'},
    'conveyor_running': {'type': 's7_bus', 'address': 'DB10.BOOL16.0'},
    'fault_active': {'type': 's7_bus', 'address': 'DB10.BOOL16.1'},

    # OPC UA addresses (CP 443-1 OPC UA Server)
    'production_rate': {'type': 'cp_opcua_server', 'address': 'ns=3;s=ProductionData.Rate'},
    'quality_ok': {'type': 'cp_opcua_server', 'address': 'ns=3;s=Quality.OK'},
    'energy_consumption': {'type': 'external_opcua', 'address': 'ns=2;s=Energy.MainMeter'},
}

# Polling interval in milliseconds
PLC_POLL_INTERVAL = 2000  # 2 seconds