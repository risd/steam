# resources for
# News, Tweets, Tumbls
from tastypie import fields

from tastypie.resources import ModelResource

from tastypie.authentication import Authentication
from tastypie.authorization import Authorization

from tastypie.serializers import Serializer

from .models import News, Tweet, Tumbl


class CommonOpenResourceMeta:
    """all news resources are open"""
    authentication = Authentication()
    authroization = Authorization()

    serializer = Serializer(formats=['json', 'jsonp'])

    always_return_data = True

    ordering = ['-timestamp']


class TweetResource(ModelResource):
    """
    Returns array of all tweets in the db
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
        resource_name = 'tumbl'

        excludes = ['timestamp']


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
