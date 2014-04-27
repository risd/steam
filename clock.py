import logging
import subprocess
import atexit

from apscheduler.scheduler import Scheduler

logging.basicConfig()
logger = logging.getLogger(__name__)
sched = Scheduler(daemon=True)
atexit.register(lambda: sched.shutdown(wait=False))

## News application scheduled processes
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
## end News application schedule processes

## Map application scheduled procceses
@sched.interval_schedule(minutes=1)
def update_top_level_geojson():
    new_geojson = subprocess.check_call(
                    ['python',
                     'manage.py',
                     'worker_write_top_level_geojson'])
    logger.info(new_geojson)
    collect_static = subprocess.check_call(
        ['python',
         'manage.py',
         'collectstatic --noinput'])
    logger.info(collect_static)
## end Map application scheduled procceses

sched.start()

while True:
    pass
