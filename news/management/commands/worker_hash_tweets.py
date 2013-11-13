import logging

from django.core.management.base import BaseCommand, CommandError

# sources of content for this app
from ...sources.hash_tweets import HashTweets

from ...models import HashTweet as SteamHashTweet

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Import Tumblr data.'

    def handle(self, *args, **kwargs):
        try:
            logging.info("Initiating HashTweet worker.")

            # where we will store all tumbls
            tweets = HashTweets()

            if (tweets.successful_connection):

                # get tumblr posts that are already
                # represented in the database, and
                # see if they need to be updated.
                logging.info("Updating existing HashTweet posts")
                existing_tweets = SteamHashTweet\
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
                logging.info("Removing deleted HashTweet posts")
                SteamHashTweet\
                    .objects\
                    .exclude(tid__in=tweets.tids)\
                    .delete()

                # create new tumblr posts
                logging.info("Figuring out which HashTweet to create")
                tweets_to_create = tweets.to_create()

                for tweet in tweets_to_create:
                    obj = SteamHashTweet(**tweet.data())
                    obj.save()

                logging.info("HashTweets now up to date.")
            else:
                logging.info("Could not update Hash Tweets.")

        except CommandError as detail:
            err = 'Error getting HashTweet data! ' +\
                '{0}'.format(detail)
            logging.error(err)
