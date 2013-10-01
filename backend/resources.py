from tastypie.authentication import Authentication
from tastypie.authentication import SessionAuthentication

from tastypie.authorization import Authorization

from tastypie.exceptions import Unauthorized

from tastypie.resources import ModelResource, ALL_WITH_RELATIONS

from tastypie.serializers import Serializer

from .models import Steamies


class UserObjectsOnlyAuthorization(Authorization):
    """
    Defines Authorization interactions with API.
    User can only read, update, and delete their
    own data. Used for profiles.
    """
    def read_list(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

    def read_detail(self, object_list, bundle):
        # user owns obj?
        return bundle.obj.user == bundle.request.user

    def create_list(self, object_list, bundle):
        # assuming they are auto-assigned to `user`
        return object_list

    def create_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def update_list(self, object_list, bundle):
        allowed = []

        # all obj may not be saved, iterate over them
        for obj in object_list:
            if obj.user == bundle.request.user:
                allowed.append(obj)

        return allowed

    def update_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user

    def delete_list(self, object_list, bundle):
        # user can not delete list
        # should never run into this.
        raise Unauthorized("Should not run into this.")

    def delete_detail(self, object_list, bundle):
        return bundle.obj.user == bundle.request.user


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
    authorization = UserObjectsOnlyAuthorization()

    serializer = Serializer(formats=['json', 'jsonp'])
    allowed_methods = ['get', 'post', 'delete']

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
