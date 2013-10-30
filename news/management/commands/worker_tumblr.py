from datetime import datetime
import logging

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

import pytumblr
import pyquery

from ...models import TumblFeature, TumblEvent


logger = logging.getLogger(__name__)


class Tumbls():
    """
    Manages tumblr posts (Tumbl class instances).
    """
    def __init__(self):
        # arrays of tumbl entrys
        self.features = []
        self.events = []

        # arrays of tids represented
        # in this object
        self.event_tids = []
        self.feature_tids = []

    def add(self, post_type, post_data):
        """
        add a Tumbl instance to be tracked
        for updates, to to be created
        """
        if post_type == 'event':
            self.event_tids.append(post_data['tid'])
            self.events.append(post_data)

        elif post_type == 'feature':
            self.feature_tids.append(post_data['tid'])
            self.features.append(post_data)

        return self

    def compare(self, post_type, steam_data):
        """
        post_type is a str
        steam_data is a TumblFeature
            or TumbleEvent model instance

        if update needs to occur, do so
        from the steam_data instance

        return self
        """
        tumbl = None

        # set `tumbl` to the dictionary
        # of data that tumblr sent us
        # to compare against steam_data
        if post_type == 'event':
            for event in self.events:
                if steam_data.tid == event['tid']:
                    tumbl = event
                    break
        elif post_type == 'feature':
            for event in self.events:
                if steam_data.tid == event['tid']:
                    tumbl = event
                    break

        # compare the tumblr data to steam data
        if tumbl:
            # we now have evidence that this
            # thing exists in some form in the
            # database, and does not need to
            # be created.
            tumbl['exists_in_database'] = True

            need_to_save = False

            if steam_data.html != tumbl['html']:
                need_to_save = True
                steam_data.html = tumbl['html']

            if steam_data.url != tumbl['url']:
                need_to_save = True
                steam_data.url = tumbl['url']

            if steam_data.state != tumbl['state']:
                need_to_save = True
                steam_data.state = tumbl['state']

            if steam_data.steam_html != tumbl['steam_html']:
                need_to_save = True
                steam_data.steam_html =\
                    tumbl._convert_html(
                        tumbl['html'])

            if steam_data.steam_url != tumbl['steam_url']:
                need_to_save = True
                steam_data.steam_url =\
                    tumbl._create_url(
                        tumbl['url'])

            if steam_data.timestamp != tumbl['timestamp']:
                need_to_save = True
                steam_data.timestamp =\
                    tumbl._create_timestamp(
                        tumbl['timestamp'])

            # save it out if anything changed
            if need_to_save:
                steam_data.save()

        return self

    def to_create(self):
        """
        looks for Tumbl objects that have
        a False ['exists_in_database'] value

        returns two lists, one for events,
        and one for features that need to
        be created in the database.
        """
        events_to_create = []
        features_to_create = []

        for event in self.events:
            if not event['exists_in_database']:
                events_to_create.append(event)

        for feature in self.features:
            if not feature['exists_in_database']:
                features_to_create.append(feature)

        # first events, then features
        return events_to_create, features_to_create


class Tumbl():
    """docstring for Tumbls"""
    def __init__(self, post):
        # respond data from Tumblr
        self.post = post

        # variables to be initialized
        # based on the Tumblr response
        self.type = None
        self.tid = None
        self.html = None
        self.url = None
        self.state = None
        self.steam_html = None
        self.steam_url = None
        self.timestamp = None

        # tracks status of the object
        # being in the database or not
        self.exists_in_database = False

        # kick it all off
        self.setup()

    def _convert_html(self, tumblr_html):
        # converts tumblr html to steam html

        # make this work
        return tumblr_html

    def _create_url(self, tumblr_slug):
        # converts tumblr slug into steam url

        # for now, we can assume this will
        # be on continuously loading page.
        # so these slugs will be anchors
        # in the page
        return tumblr_slug

    def _create_timestamp(self, tumblr_timestamp):
        return datetime.utcfromtimestamp(tumblr_timestamp)

    def setup(self):
        if u'feature' in self.post[u'tags']:
            self.type = 'feature'

        elif u'event' in self.post[u'tags']:
            self.type = 'event'

        else:
            self.type = None
            err = 'Tumblr post that was not an ' +\
                'event, or a feature. ' +\
                '{0}'.format(self.post[u'tags'])
            logging.error(err)

        self.tid = self.post[u'id']
        self.html = self.post[u'body']
        self.url = self.post[u'post_url']
        self.state = self.post[u'state']
        self.steam_html = self._convert_html(self.post[u'body'])
        self.steam_url = self._create_url(self.post[u'slug'])
        self.timestamp =\
            self._create_timestamp(self.post[u'timestamp'])

        return self

    def data(self):
        return self.type, {
            'tid': self.tid,
            'html': self.html,
            'url': self.url,
            'state': self.state,
            'steam_html': self.steam_html,
            'steam_url': self.steam_url,
            'timestamp': self.timestamp,
            'exists_in_database': self.exists_in_database,
        }


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Import Tumblr data.'

    def handle(self, *args, **kwargs):
        try:
            logging.info("Initiating tumblr worker.")
            client = pytumblr.TumblrRestClient(
                settings.TUMBLR_CONSUMER_KEY,
                settings.TUMBLR_CONSUMER_SECRET)

            tumblr_posts = client\
                .posts('risd-media-dev.tumblr.com',
                       limit=1000)

            # where we will store all tumbls
            tumbls = Tumbls()

            # quantify posts from tumblr
            for post in tumblr_posts[u'posts']:
                post_type, post_data = Tumbl(post).data()
                tumbls.add(post_type, post_data)

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
                del event['exists_in_database']
                obj = TumblEvent(**event)
                obj.save()

            for feature in features_to_create:
                del feature['exists_in_database']
                obj = TumblFeature(**feature)
                obj.save()

            logging.info("Tumblr posts now up to date.")

        except CommandError as detail:
            err = 'Error getting tumblr data! ' +\
                '{0}'.format(detail)
            logging.error(err)
