# resources for
# News, Tweets, Tumbls

from tastypie.authentication import Authentication
from tastypie.authorization import Authorization

from tastypie.serializers import Serializer

from .models import News, Tweet, Tumbl


class CommonOpenResourceMeta:
    """all news resources are open"""
    authentication = Authentication()
    authroization = Authorization()

    serializer = Serializer(formats=['json', 'jsonp'])
