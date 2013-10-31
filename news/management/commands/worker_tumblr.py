import logging

from django.core.management.base import BaseCommand, CommandError

# sources of content for this app
from ...sources.tumbl import Tumbl
from ...sources.tumbls import Tumbls

from ...models import TumblFeature, TumblEvent


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
            existing_features = TumblFeature\
                .objects\
                .filter(tid__in=tumbls.feature_tids)

            existing_events = TumblEvent\
                .objects\
                .filter(tid__in=tumbls.event_tids)

            for existing_feature in existing_features:
                # compare existing features to tumbls data
                # updates if necessary
                tumbls.compare('feature', existing_feature)

            for existing_event in existing_events:
                # compare existing features to tumbls
                # updates if necessary
                tumbls.compare('event', existing_event)

            # get entries in the database
            # that are not represented in the
            # tumblr data. means they have been
            # deleted, and should be removed
            # here as well
            logging.info("Removing deleted tumblr posts")
            TumblFeature\
                .objects\
                .exclude(tid__in=tumbls.feature_tids)\
                .delete()
            TumblEvent\
                .objects\
                .exclude(tid__in=tumbls.event_tids)\
                .delete()

            # create new tumblr posts
            logging.info("Figuring out which posts to create")
            events_to_create, features_to_create =\
                tumbls.to_create()

            for event in events_to_create:
                post_type, post_data = event.data()
                obj = TumblEvent(**post_data)
                obj.save()
                event.exists_in_database = True

            for feature in features_to_create:
                post_type, post_data = feature.data()
                obj = TumblFeature(**post_data)
                obj.save()
                feature.exists_in_database = True

            logging.info("Tumblr posts now up to date.")

        except CommandError as detail:
            err = 'Error getting tumblr data! ' +\
                '{0}'.format(detail)
            logging.error(err)
