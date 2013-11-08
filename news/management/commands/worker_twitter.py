import logging

from django.core.management.base import BaseCommand, CommandError

# sources of content for this app
from ...sources.tweet import Tweet
from ...sources.tweets import Tweets

from ...models import Tweet as SteamTweet
from ...models import News as SteamNews


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Import Tumblr data.'

    def handle(self, *args, **kwargs):
        try:
            logging.info("Initiating twitter worker.")

            # where we will store all tumbls
            tweets = Tweets()

            # get tumblr posts that are already
            # represented in the database, and
            # see if they need to be updated.
            logging.info("Updating existing twitter posts")
            existing_tweets = SteamTweet\
                .objects\
                .filter(tid__in=tweets.tids)

            for existing_tweet in existing_tweets:
                # compare existing features to tweet data
                # updates if necessary
                tweets.compare(existing_tweet)

            # get entries in the database
            # that are not represented in the
            # twitter data. means they have been
            # deleted, and should be removed
            # here as well
            logging.info("Removing deleted twitter posts")
            SteamTweet\
                .objects\
                .exclude(tid__in=tweets.tids)\
                .delete()

            # create new tumblr posts
            logging.info("Figuring out which tweets to create")
            tweets_to_create = tweets.to_create()

            for tweet in tweets_to_create:
                obj = SteamTweet(**tweet.data())
                obj.save()

                if obj.pk:

                    tweet.exists_in_database = True

                    news = SteamNews()
                    news.tweet = obj
                    news.save()

                    logger.info('saving')
                    logger.info(news)

                else:
                    logger.info('could not save. here is data:')
                    logger.info(tweet.data())

            logging.info("Tweets now up to date.")

        except CommandError as detail:
            err = 'Error getting Tweet data! ' +\
                '{0}'.format(detail)
            logging.error(err)
