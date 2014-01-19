# Django settings for backend project.
import os

APP_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def env_var(key, default=None):
    """Retrieves env vars and makes Python boolean replacements"""
    val = os.environ.get(key, default)
    if val == 'True':
        val = True
    elif val == 'False':
        val = False
    return val

# parse database configuration from $DATABASE_URL
import dj_database_url
DATABASES = {
    'default': {
        'ENGINE': '',
        'NAME': '',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}
DATABASES['default'] = dj_database_url.config()
DATABASES['default']['ENGINE'] = 'django.db.backends.postgresql_psycopg2'

# honor the 'x-forwarded-proto' header fro request.is_secure()
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


DEBUG = env_var('DEBUG', False)
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

# Hosts/domain names that are valid for this site; required if DEBUG is False
# See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
ALLOWED_HOSTS = ['*']

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/New_York'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/var/www/example.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://example.com/media/", "http://media.example.com/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/var/www/example.com/static/"
STATIC_ROOT = 'staticfiles'

# URL prefix for static files.
# Example: "http://example.com/static/", "http://static.example.com/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(APP_ROOT, 'static/'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = env_var('DJANGO_SECRET_KEY')

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    'django.middleware.clickjacking.XFrameOptionsMiddleware',

    # 3rd party
    'social.apps.django_app.middleware.SocialAuthExceptionMiddleware',

    # local
    'backend.middleware.crossdomainxhr.XsSharingMiddleware',
)

ROOT_URLCONF = 'backend.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'backend.wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(APP_ROOT, 'templates/'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',

    # 3rd party
    'south',
    'tastypie',
    'social.apps.django_app.default',

    # primary
    'backend',
    'map',
    'news',
    'marketing',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s' +\
                '%(process)d %(thread)d %(message)s',
        },
        'simple': {
            'format': '%(levelname)s %(message)s',
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
        'logfile': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(APP_ROOT, 'logfile'),
            'maxBytes': 50000,
            'backupCount': 2,
            'formatter': 'simple',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'propagate': True,
            'level': 'WARN',
        },
        'django.db.backends': {
            'handlers': ['console'],
            'propagate': False,
            'level': 'DEBUG',
        },
        'django.request': {
            'handlers': ['mail_admins'],
            'propagate': True,
            'level': 'ERROR',
        },
        '': {  # could alternatively be the name of the app
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    }
}


### Cross domain middleware config, mostly for tastypie
XS_SHARING_ALLOWED_ORIGINS = '*'
XS_SHARING_ALLOWED_METHODS = ['POST', 'GET']
XS_SHARING_ALLOWED_HEADERS = ['Content-Type', 'application/json']
XS_SHARING_ALLOWED_CREDENTIALS = 'true'
CSRF_COOKIE_NAME = 'csrftoken'

# paths to not apply this stuff to.
XS_SHARING_EXEMPT_PATHS = ['/join-us/', ]
### end cross domain middleware config, mostly for tastypie

### Social auth config
AUTHENTICATION_BACKENDS = (
    'social.backends.google.GoogleOAuth2',
    'social.backends.twitter.TwitterOAuth',
    'social.backends.facebook.FacebookAppOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

SOCIAL_AUTH_TWITTER_KEY = env_var('SOCIAL_AUTH_TWITTER_KEY')
SOCIAL_AUTH_TWITTER_SECRET = env_var('SOCIAL_AUTH_TWITTER_SECRET')
SOCIAL_AUTH_FACEBOOK_APP_KEY = env_var('SOCIAL_AUTH_FACEBOOK_APP_KEY')
SOCIAL_AUTH_FACEBOOK_APP_SECRET = env_var('SOCIAL_AUTH_FACEBOOK_APP_SECRET')
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = env_var('SOCIAL_AUTH_GOOGLE_OAUTH2_KEY')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = env_var('SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET')

# LOGIN_URL = '/login-form/'
# LOGIN_REDIRECT_URL = 'http://localhost:8008/logged-in/'
SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/logged-in/'
SOCIAL_AUTH_LOGIN_ERROR_URL = '/login-error/'

SOCIAL_AUTH_DEFAULT_USERNAME = 'new_social_auth_user'

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'social.apps.django_app.context_processors.backends',
    'social.apps.django_app.context_processors.login_redirect',
)

SOCIAL_AUTH_ENABLED_BACKENDS = ('twitter', 'facebook', 'google')

SOCIAL_AUTH_SANITIZE_REDIRECTS = False

SOCIAL_AUTH_PIPELINE = (
    'social.pipeline.social_auth.social_details',
    'social.pipeline.social_auth.social_uid',
    'social.pipeline.social_auth.auth_allowed',
    'social.pipeline.social_auth.social_user',
    'social.pipeline.user.get_username',
    # 'social.pipeline.mail.mail_validation',
    # 'social.pipeline.social_auth.associate_by_email',
    'social.pipeline.user.create_user',
    'social.pipeline.social_auth.associate_user',
    'social.pipeline.social_auth.load_extra_data',
    'social.pipeline.user.user_details',
    'map.pipeline.create_steamie',
    'map.pipeline.get_avatar_url',
)
### end Social auth config

### news app config
TUMBLR_CONSUMER_KEY = env_var('TUMBLR_CONSUMER_KEY')
TUMBLR_CONSUMER_SECRET = env_var('TUMBLR_CONSUMER_SECRET')
TUMBLR_URL = 'stem-to-steam.tumblr.com'

NEWS_TWITTER_CONSUMER_KEY = env_var('NEWS_TWITTER_CONSUMER_KEY')
NEWS_TWITTER_CONSUMER_SECRET =\
    env_var('NEWS_TWITTER_CONSUMER_SECRET')
NEWS_TWITTER_ACCESS_TOKEN = env_var('NEWS_TWITTER_ACCESS_TOKEN')
NEWS_TWITTER_ACCESS_TOKEN_SECRET =\
    env_var('NEWS_TWITTER_ACCESS_TOKEN_SECRET')
NEWS_TWITTER_ACCOUNT = env_var('NEWS_TWITTER_ACCOUNT')
### end news app config

### marketing app config
MAILCHIMP_APIKEY = env_var('MAILCHIMP_APIKEY')
MAILCHIMP_LIST_ID = env_var('MAILCHIMP_LIST_ID')
### end marketing app config
