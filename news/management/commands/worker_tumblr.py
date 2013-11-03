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

            # get tumblr posts that are already
            # represented in the database, and
            # see if they need to be updated.
            logging.info("Updating existing tumblr posts")
            existing_tumbls = SteamTumbl\
                .objects\
                .filter(tid__in=tumbls.tids)

            for existing_tumbl in existing_tumbls:
                # compare existing features to tumbls data
                # updates if necessary
                tumbls.compare(existing_tumbl)

            # get entries in the database
            # that are not represented in the
            # tumblr data. means they have been
            # deleted, and should be removed
            # here as well
            logging.info("Removing deleted tumblr posts")
            SteamTumbl\
                .objects\
                .exclude(tid__in=tumbls.tids)\
                .delete()

            # create new tumblr posts
            logging.info("Figuring out which posts to create")
            tumbls_to_create = tumbls.to_create()

            logging.info("Creating Tumbls")
            for tumbl in tumbls_to_create:
                obj = SteamTumbl(**tumbl.data())
                obj.save()

                tumbl.exists_in_database = True

                news = SteamNews()
                news.tumbl = obj
                news.save()

            logging.info("Tumblr posts now up to date.")

        except CommandError as detail:
            err = 'Error getting tumblr data! ' +\
                '{0}'.format(detail)
            logging.error(err)
