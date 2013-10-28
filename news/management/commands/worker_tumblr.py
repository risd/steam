import logging

from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

import pytumblr
import pyquery

from ...models import TumblFeature, TumblEvent


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Test tumblr.'

    def tumblrToSteam(self, content):
        # takes in tumblr content,
        # and formats it for the steam blog

        # make this actually work
        formatted_content = content

        return formatted_content

    def handle(self, *args, **kwargs):
        try:
            client = pytumblr.TumblrRestClient(
                settings.TUMBLR_CONSUMER_KEY,
                settings.TUMBLR_CONSUMER_SECRET)

            response = client.posts('risd-media-dev.tumblr.com')

            for post in response[u'posts']:
                need_to_save = False

                if u'feature' in post[u'tags']:
                    steam_entry, created = TumblFeature\
                        .objects\
                        .get_or_create(tid=post[u'id'])

                elif u'event' in post[u'tags']:
                    steam_entry, created = TumblEvent\
                        .objects\
                        .get_or_create(tid=post[u'id'])

                else:
                    err = 'Tumblr post that was not an ' +\
                        'event, or a feature. ' +\
                        '{0}'.format(post[u'tags'])
                    logging.error(err)

                if steam_entry.url != post[u'post_url']:
                    need_to_save = True
                    steam_entry.url = post[u'post_url']

                if steam_entry.state != post[u'state']:
                    need_to_save = True
                    steam_entry.state = post[u'state']

                if steam_entry.content != post[u'body']:
                    need_to_save = True
                    # update the content
                    steam_entry.content = post[u'body']
                    steam_entry.steam_content =\
                        self.tumblrToSteam(post[u'body'])

                if steam_entry.steam_url != post[u'slug']:
                    need_to_save = True
                    steam_entry.state = post[u'slug']

                if created or need_to_save:
                    steam_entry.save()

        except CommandError as detail:
            print 'Error getting tumblr data! ' +\
                '{0}'.format(detail)
