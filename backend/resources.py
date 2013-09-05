from tastypie.authentication import Authentication
from tastypie.authentication import SessionAuthentication

from tastypie.authorization import Authorization
from tastypie.authorization import DjangoAuthorization

from tastypie.resources import ModelResource, ALL_WITH_RELATIONS

from tastypie.serializers import Serializer


from .models import Steamies


class CommonOpenResourceMeta:
    """
    Open resources will sublcass this.
    """
    authentication = Authentication()
    authorization = Authorization()

    serializer = Serializer(formats=['json', 'jsonp'])
    allowed_methods = ['get']

    always_return_data = True


class CommonAuthResourceMeta:
    """
    Auth resources will subclass this.
    """
    authentication = SessionAuthentication()
    authorization = DjangoAuthorization()

    serializer = Serializer(formats=['json', 'jsonp'])
    allowed_methods = ['post', 'delete']

    always_return_data = True


class GeoResource(ModelResource):
    """
    Returns geojson of top_level steaminess
    steaminess is the count of individual
    and institution steamies. Broken down
    by their 'work in' field
    """
    class Meta(CommonOpenResourceMeta):

        queryset = Steamies.objects.all()
        resource_name = 'geo'


class NetworkResource(ModelResource):
    """
    Returns array of json for steamies
    that are associated with a particular
    top level uid
    """
    class Meta(CommonOpenResourceMeta):
        queryset = Steamies.objects.all()
        resource_name = 'network'


class AuthSteamieResource(ModelResource):
    """
    Used to manage Steamie data. Individuals and Institutions.
    """
    class Meta(CommonAuthResourceMeta):
        queryset = Steamies.objects.all()
        resource_name = 'steamie'
