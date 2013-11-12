import logging

from django.core.management.base import BaseCommand, CommandError

# sources of content for this app
from ...sources.tumbls import Tumbls

from ...models import Tumbl as SteamTumbl
from ...models import News as SteamNews


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Import Tumblr data.'

    def handle(self, *args, **kwargs):
        try:
            logging.info("Initiating tumblr worker.")

            # where we will store all tumbls
            tumbls = Tumbls()

            logging.info('# of tumbls: {0}'.format(len(tumbls.tumbls)))

        except CommandError as detail:
            err = 'Error getting tumblr data! ' +\
                '{0}'.format(detail)
            logging.error(err)
