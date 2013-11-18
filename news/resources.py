# resources for
# News, Tweets, Tumbls
import logging
from datetime import datetime
from datetime import timedelta
import pytz

from django.conf.urls import url

from tastypie import fields

from tastypie.resources import ModelResource

from tastypie.authentication import Authentication
from tastypie.authorization import Authorization

from tastypie.serializers import Serializer

from .models import News, Tweet, Tumbl, HashTweet

logger = logging.getLogger(__name__)


class CommonOpenResourceMeta:
    """all news resources are open"""
    authentication = Authentication()
    authroization = Authorization()

    serializer = Serializer(formats=['json', 'jsonp'])

    always_return_data = True

    ordering = ['-timestamp']


class HashTweetResource(ModelResource):
    """
    Returns array of all HashTweet in the db
    """
    class Meta(CommonOpenResourceMeta):
        queryset = HashTweet.objects.all()
        resource_name = 'hash_tweet'


class TweetResource(ModelResource):
    """
    Returns array of all Tweet in the db
    Used to power the News Resource below.
    """
    class Meta(CommonOpenResourceMeta):
        queryset = Tweet.objects.all()
        resource_name = 'tweet'


class TumblResource(ModelResource):
    """
    Returns array of all tumbls in the db
    """
    class Meta(CommonOpenResourceMeta):
        queryset = Tumbl.objects.all()

        # resource name is tumbl_ref
        # because its not actuallu used
        # by the front end, its just
        # an internal API resource
        resource_name = 'tumbl_ref'

        excludes = ['timestamp']


class AnnounceTumblResource(ModelResource):
    """
    Returns Announcement tumbls wrapped in news objects
    """
    tumbl = fields.ForeignKey(
        TumblResource,
        'tumbl',
        null=True,
        full=True)

    class Meta(CommonOpenResourceMeta):
        # get the single announcement
        since_announcement = timedelta(days=5)
        now = datetime.now().replace(tzinfo=pytz.utc)
        announcement_range = now - since_announcement

        announcement_qs = Tumbl.objects.all()\
                                       .filter(announcement=True)\
                                       .filter(timestamp__gt=announcement_range)
        # get the news object for it,
        # so it can be linked back to.
        queryset = News.objects.all()\
                               .filter(tumbl__in=announcement_qs)

        resource_name = 'announcement'

        ordering = ['-epoch_timestamp']
        limit = 1


class NewsTumblResource(ModelResource):
    """
    Returns tumbls, wrapped in their news object
    """
    tumbl = fields.ForeignKey(
        TumblResource,
        'tumbl',
        null=True,
        full=True)

    class Meta(CommonOpenResourceMeta):
        queryset = News.objects.all().exclude(tumbl=None)
        resource_name = 'tumbl'

        ordering = ['-epoch_timestamp']


class NewsResource(ModelResource):
    """
    Manages News models.
    """
    tweet = fields.ForeignKey(
        TweetResource,
        'tweet',
        null=True,
        full=True)
    tumbl = fields.ForeignKey(
        TumblResource,
        'tumbl',
        null=True,
        full=True)

    class Meta(CommonOpenResourceMeta):
        queryset = News.objects.all()
        resource_name = 'news'

        ordering = ['-epoch_timestamp']
