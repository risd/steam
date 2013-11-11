from django.conf import settings

from twython import Twython

from .hash_tweet import HashTweet


class HashTweets():
    """
    Manages HashTweet class instances.
    """
    def __init__(self):
        # arrays of tweets classes
        self.tweets = []

        # arrays of tids represented
        # in this object
        self.tids = []

        # twitter connection
        self.api = Twython(
            settings.NEWS_TWITTER_CONSUMER_KEY,
            settings.NEWS_TWITTER_CONSUMER_SECRET,
            settings.NEWS_TWITTER_ACCESS_TOKEN,
            settings.NEWS_TWITTER_ACCESS_TOKEN_SECRET)

        # raw twitter response
        # tweets are stashed in
        # raw[u'statuses']
        self.raw = self.api.search(q='%23stemtosteam',
                                   result_type='recent')

        # add all posts to this manager
        for tweet in self.raw[u'statuses']:
            self.add(HashTweet(tweet))

    def add(self, tweet):
        """
        add a HashTweet instance to be tracked
        for updates, to to be created
        """
        self.tids.append(tweet.tid)
        self.tweets.append(tweet)

        return self

    def compare(self, steam_model):
        """
        steam_model is a HashTweet model instance

        if update needs to occur, do so
        from the steam_model instance

        return self
        """
        tweet = None

        # set `tweet` to the HashTweet class
        # of data that twitter sent us
        # to compare against steam_model
        for t in self.tweets:
            if steam_model.tid == t.tid:
                tweet = t
                break

        # compare the twitter data to steam data
        if tweet:
            # we now have evidence that this
            # thing exists in some form in the
            # database, and does not need to
            # be created.
            tweet.exists_in_database = True

            need_to_save = False

            if steam_model.user != tweet.user:
                need_to_save = True
                steam_model.user = tweet.user

            if steam_model.screen_name != tweet.screen_name:
                need_to_save = True
                steam_model.screen_name = tweet.screen_name

            if steam_model.text != tweet.text:
                need_to_save = True
                steam_model.text = tweet.text

            if steam_model.html != tweet.html:
                need_to_save = True
                steam_model.html = tweet.html

            if steam_model.epoch_timestamp != tweet.epoch_timestamp:
                need_to_save = True
                steam_model.epoch_timestamp = tweet.epoch_timestamp

            if steam_model.timestamp != tweet.timestamp:
                need_to_save = True
                steam_model.timestamp = tweet.timestamp

            if steam_model.url != tweet.url:
                need_to_save = True
                steam_model.url = tweet.url

            # save it out if anything changed
            if need_to_save:
                steam_model.save()

        return self

    def to_create(self):
        """
        looks for HashTweet objects that have
        a False ['exists_in_database'] value

        returns a list of tweets that
        need to be created in the database.
        """
        tweets_to_create = []

        for tweet in self.tweets:
            if not tweet.exists_in_database:
                tweets_to_create.append(tweet)

        return tweets_to_create
