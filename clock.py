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
    tweets = subprocess.check_call(['foreman',
                                    'run',
                                    'python',
                                    'manage.py',
                                    'worker_twitter'])
    logger.info(tweets)
    tumblr = subprocess.check_call(['foreman',
                                    'run',
                                    'python',
                                    'manage.py',
                                    'worker_tumblr'])
    logger.info(tumblr)

sched.start()

while True:
    pass
