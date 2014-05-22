web: python manage.py collectstatic --noinput; gunicorn backend.wsgi --workers $WEB_CONCURRENCY
clock: python clock.py