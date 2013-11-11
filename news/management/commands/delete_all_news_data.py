import logging

from django.core.management.base import BaseCommand, CommandError

from ...models import News, HashTweets

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Delete all Individual, Institution and Initiative data.'

    def handle(self, *args, **kwargs):
        try:

            logger.info('Deleting News models')
            News.objects.all().delete()

            logger.info('Deleting all HashTweet models')
            HashTweets.objects.all().delete()

        except CommandError as detail:
            err = 'Error deleting data! ' +\
                '{0}'.format(detail)

            logger.error(err)
