import subprocess
import atexit

from apscheduler.scheduler import Scheduler

sched = Scheduler(daemon=True)
atexit.register(lambda: sched.shutdown(wait=False))


@sched.interval_schedule(minutes=1)
def update_from_apis():
    print "This job will update twitter and tumblr"
    tweets = subprocess.check_call(['foreman',
                                    'run',
                                    'python',
                                    'manage.py',
                                    'worker_twitter'])
    tumblr = subprocess.check_call(['foreman',
                                    'run',
                                    'python',
                                    'manage.py',
                                    'worker_tumblr'])

sched.start()

while True:
    pass
