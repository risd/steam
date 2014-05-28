import logging
import subprocess
import atexit

from apscheduler.scheduler import Scheduler


logging.basicConfig()
logger = logging.getLogger(__name__)
sched = Scheduler(daemon=True)
atexit.register(lambda: sched.shutdown(wait=False))

## News application scheduled processes
## ----
# @sched.interval_schedule(minutes=1)
# def update_for_news():
#     tumblr = subprocess.check_call(['python',
#                                     'manage.py',
#                                     'worker_news_tumbls'])

#     logger.info(tumblr)

#     tweets = subprocess.check_call(['python',
#                                     'manage.py',
#                                     'worker_news_tweets'])
#     logger.info(tweets)


# @sched.interval_schedule(minutes=15)
# def update_for_home():
#     hash_tweets = subprocess.check_call(['python',
#                                          'manage.py',
#                                          'worker_hash_tweets'])
#     logger.info(hash_tweets)

## Map application scheduled procceses
## ---
@sched.interval_schedule(minutes=1)
def update_top_level_geojson():
    new_geojson = subprocess.check_call(
                    ['python',
                     'manage.py',
                     'worker_write_top_level_geojson'])
    logger.info(new_geojson)

@sched.interval_schedule(hours=6)
def check_tlg_values():
    check_tlg = subprocess.check_call(
                    ['python',
                     'manage.py',
                     'reset_tlg_count'])
    logger.info(check_tlg)


sched.start()

while True:
    pass
