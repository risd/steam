import logging
from django.conf import settings

import pytumblr

from .tumbl import Tumbl

logger = logging.getLogger(__name__)


class Tumbls():
    """
    Manages tumblr posts (Tumbl class instances).
    """
    def __init__(self):
        # arrays of tumbl entrys, as Tumbl objects
        self.tumbls = []

        # Boolean that tracks if the calls
        # to the server were successful.
        self.successful_connection = False

        # arrays of tids represented
        # in this object
        self.tids = []

        # tumblr connection
        self.client = pytumblr.TumblrRestClient(
            settings.TUMBLR_CONSUMER_KEY,
            settings.TUMBLR_CONSUMER_SECRET)

        # raw tumblr response
        # posts are stashed in
        # raw[u'posts']
        self.raw = self.get_tumbls()

        # add all posts to this manager
        for post in self.raw:
            tumbl = Tumbl(post)
            self.add(tumbl)

    def get_tumbls(self):
        """
        Requires self to have a client (pytumblr.TumblrRestClient)
        instance. Uses it to call the API as many times as necessary
        in order to get all of the posts in memory.

        Returns an array of all posts
        Call the API, get all the tumbls.
        """
        offset = 0
        posts_per_call = 20
        posts = []
        total_posts = 0

        try:
            # intiial request
            response = self.client\
                           .posts(settings.TUMBLR_URL,
                                  limit=posts_per_call)
            # find out how many posts, will determine
            # how many times to loop
            total_posts = response[u'total_posts']

            posts += response[u'posts']

            # loop through requests until you have all of the posts
            while len(posts) < total_posts:
                offset += posts_per_call
                response = self.client\
                               .posts(settings.TUMBLR_URL,
                                      limit=posts_per_call,
                                      offset=offset)
                posts += response[u'posts']

            self.successful_connection = True
        except:
            self.successful_connection = False
            logging.error('Problems getting tumbls from Tumblr API.')

        return posts

    def add(self, tumbl):
        """
        add a Tumbl instance to be tracked
        for updates, to to be created
        """
        self.tids.append(tumbl.tid)
        self.tumbls.append(tumbl)

        return self

    def compare(self, steam_model):
        """
        steam_model is a Tumbl model instance

        if update needs to occur, do so
        from the steam_model instance

        return self
        """
        tumbl = None

        # set `tumbl` to the Tumbl class
        # of data that tumblr sent us
        # to compare against steam_model
        for t in self.tumbls:
            if steam_model.tid == t.tid:
                tumbl = t
                break

        # compare the tumblr data to steam data
        if tumbl:
            # we now have evidence that this
            # thing exists in some form in the
            # database, and does not need to
            # be created.
            tumbl.exists_in_database = True

            need_to_save = False

            if steam_model.tagged_type != tumbl.tagged_type:
                need_to_save = True
                steam_model.tagged_type = tumbl.tagged_type

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

            if steam_model.epoch_timestamp != tumbl.epoch_timestamp:
                need_to_save = True
                steam_model.epoch_timestamp = tumbl.epoch_timestamp

            if steam_model.timestamp != tumbl.timestamp:
                need_to_save = True
                steam_model.timestamp = tumbl.timestamp

            if steam_model.ticker_timestamp !=\
                    tumbl.ticker_timestamp:

                need_to_save = True

                steam_model.ticker_timestamp =\
                    tumbl.ticker_timestamp

            # save it out if anything changed
            if need_to_save:
                steam_model.save()

        return self

    def to_create(self):
        """
        looks for Tumbl objects that have
        a False ['exists_in_database'] value

        returns a list of tumbls that
        need to be created in the database.
        """
        tumbls_to_create = []

        for tumbl in self.tumbls:
            if not tumbl.exists_in_database:
                tumbls_to_create.append(tumbl)

        return tumbls_to_create
