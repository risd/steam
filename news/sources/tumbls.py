from django.conf import settings

import pytumblr

from .tumbl import Tumbl


class Tumbls():
    """
    Manages tumblr posts (Tumbl class instances).
    """
    def __init__(self):
        # arrays of tumbl entrys, as Tumbl objects
        self.features = []
        self.events = []

        # arrays of tids represented
        # in this object
        self.event_tids = []
        self.feature_tids = []

        # tumblr connection
        self.client = pytumblr.TumblrRestClient(
            settings.TUMBLR_CONSUMER_KEY,
            settings.TUMBLR_CONSUMER_SECRET)

        # raw tumblr response
        # posts are stashed in
        # raw[u'posts']
        self.raw = self.client\
            .posts('risd-media-dev.tumblr.com',
                   limit=1000)

        # add all posts to this manager
        for post in self.raw[u'posts']:
            tumbl = Tumbl(post)
            self.add(tumbl)

    def add(self, tumbl):
        """
        add a Tumbl instance to be tracked
        for updates, to to be created
        """
        if tumbl.type == 'event':
            self.event_tids.append(tumbl.tid)
            self.events.append(tumbl)

        elif tumbl.type == 'feature':
            self.feature_tids.append(tumbl.tid)
            self.features.append(tumbl)

        return self

    def compare(self, post_type, steam_model):
        """
        post_type is a str
        steam_model is a TumblFeature
            or TumbleEvent model instance

        if update needs to occur, do so
        from the steam_model instance

        return self
        """
        tumbl = None

        # set `tumbl` to the dictionary
        # of data that tumblr sent us
        # to compare against steam_model
        if post_type == 'event':
            for event in self.events:
                if steam_model.tid == event.tid:
                    tumbl = event
                    break
        elif post_type == 'feature':
            for feature in self.features:
                if steam_model.tid == feature.tid:
                    tumbl = feature
                    break

        # compare the tumblr data to steam data
        if tumbl:
            # we now have evidence that this
            # thing exists in some form in the
            # database, and does not need to
            # be created.
            tumbl.exists_in_database = True

            need_to_save = False

            if steam_model.html != tumbl.html:
                need_to_save = True
                steam_model.html = tumbl.html

            if steam_model.url != tumbl.url:
                need_to_save = True
                steam_model.url = tumbl.url

            if steam_model.title != tumbl.title:
                need_to_save = True
                steam_model.title = tumbl.title

            if steam_model.state != tumbl.state:
                need_to_save = True
                steam_model.state = tumbl.state

            if steam_model.steam_html != tumbl.steam_html:
                need_to_save = True
                steam_model.steam_html = tumbl.steam_html

            if steam_model.steam_url != tumbl.steam_url:
                need_to_save = True
                steam_model.steam_url = tumbl.steam_url

            if steam_model.timestamp != tumbl.timestamp:
                need_to_save = True
                steam_model.timestamp = tumbl.timestamp

            # save it out if anything changed
            if need_to_save:
                steam_model.save()

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
            if not event.exists_in_database:
                events_to_create.append(event)

        for feature in self.features:
            if not feature.exists_in_database:
                features_to_create.append(feature)

        # first events, then features
        return events_to_create, features_to_create
