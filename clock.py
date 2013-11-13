import logging
import subprocess
import atexit

from apscheduler.scheduler import Scheduler

logging.basicConfig()
logger = logging.getLogger(__name__)
sched = Scheduler(daemon=True)
atexit.register(lambda: sched.shutdown(wait=False))


@sched.interval_schedule(minutes=1)
def update_from_apis():
    tweets = subprocess.check_call(['python',
                                    'manage.py',
                                    'worker_news_tweets'])
    logger.info(tweets)
    tumblr = subprocess.check_call(['python',
                                    'manage.py',
                                    'worker_news_tumbls'])

    logger.info(tumblr)
    hash_tweets = subprocess.check_call(['python',
                                         'manage.py',
                                         'worker_hash_tweets'])
    logger.info(hash_tweets)

sched.start()

while True:
    pass
