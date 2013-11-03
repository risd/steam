"""
The news.models.News object needs to sorted
by either tweet.timestamp, or tumbl.timestamp.
Whichever is appropriate for that instance.

How best to do that, and play nice with
tastypie, which is driving the API.

Looks like you can alter_list_data_to_serialize
within a Tastypie resource.
"""


import logging
from ...models import News
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Test sorting mechanisms for News data.'

    def showcase(self, data):
        oType = None
        oTime = None
        for obj in data:
            if obj.tumbl:
                oType = 'tumbl'
                oTime = obj.tumbl.timestamp
            else:
                oType = 'tweet'
                oTime = obj.tweet.timestamp

            print '{0}: {1}'.format(oType, oTime)

    def handle(self, *args, **kwargs):
        n = News.objects.all()

        logger.info('Original Order')
        self.showcase(n)

        # this works, but cant be used with tastypie
        # because tastypie expects a queryset,
        # this results in a list.
        f = lambda x: x.tumbl.timestamp if x.tumbl is not None else x.tweet.timestamp
        ordered = sorted(n, key=f, reverse=True)
        logger.info('Sorted Order')
        self.showcase(ordered)

        # could also try doing a rawqueryset
        # but tastypie doesn't play nice with
        # those either.
