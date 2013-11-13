import logging
import subprocess
import atexit

from apscheduler.scheduler import Scheduler

logging.basicConfig()
logger = logging.getLogger(__name__)
sched = Scheduler(daemon=True)
atexit.register(lambda: sched.shutdown(wait=False))


@sched.interval_schedule(minutes=1)
def update_for_news():
    tumblr = subprocess.check_call(['python',
                                    'manage.py',
                                    'worker_news_tumbls'])

    logger.info(tumblr)

    tweets = subprocess.check_call(['python',
                                    'manage.py',
                                    'worker_news_tweets'])
    logger.info(tweets)


@sched.interval_schedule(minutes=15)
def update_for_home():
    hash_tweets = subprocess.check_call(['python',
                                         'manage.py',
                                         'worker_hash_tweets'])
    logger.info(hash_tweets)

sched.start()

while True:
    pass
