from django.conf.urls import url

from tastypie import fields

from tastypie.authentication import Authentication
from tastypie.authentication import SessionAuthentication

from tastypie.authorization import Authorization

from tastypie.exceptions import Unauthorized

from tastypie.resources import ModelResource

from tastypie.serializers import Serializer

from tastypie.http import *
from tastypie.utils.urls import trailing_slash

from django.contrib.auth.models import User
from .models import Steamies, Institution, Individual, TopLevelGeo


class UserObjectsOnlyAuthorization(Authorization):
    """
    Defines Authorization interactions with API.
    User can only read, update, and delete their
    own data. Used for profiles.
    """
    def read_list(self, object_list, bundle):
        return object_list.filter(user=bundle.request.user)

    def read_detail(self, object_list, bundle):
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
    allowed_methods = ['get', 'post', 'delete', 'put', 'patch']

    always_return_data = True


class TopLevelGeoResource(ModelResource):
    """
    Returns TopLevelGeo objects to AuthSteamieResource
    to fill out a users profile
    Also used to return TopLevelGeo metadata to
    network initiation requests
    """
    class Meta(CommonOpenResourceMeta):
        resource_name = 'toplevelgeo'
        queryset = TopLevelGeo.objects.all()


class InstitutionResource(ModelResource):
    """
    Returns Institution objects to SteamiesResource
    to fill out network diagram
    """
    # steamies = fields.ToManyField(
    #     'map.resources.SteamiesResource',
    #     'institution',
    #     related_name='institution')
    class Meta(CommonOpenResourceMeta):
        queryset = Institution.objects.all()
        fields = ['name',
                  'id']


class IndividualResource(ModelResource):
    """
    Returns Institution objects to SteamiesResource
    to fill out network diagram
    """
    # steamies = fields.ToManyField(
    #     'map.resources.SteamiesResource',
    #     'individual',
    #     related_name='individual')
    class Meta(CommonOpenResourceMeta):
        queryset = Individual.objects.all()
        fields = ['first_name',
                  'last_name',
                  'id']


class NetworkResource(ModelResource):
    """
    Returns array of json for steamies
    that are associated with a particular
    top level uid
    """
    steamies = fields.ToManyField(
        'map.resources.SteamiesResource',
        'top_level',
        related_name='top_level',
        full=True)
    def prepend_urls(self):
        return [
            url(
            r"^(?P<resource_name>%s)/" % (self._meta.resource_name) +\
            r"(?P<pk>\w[\w/-]*)" +\
            r"/steamies%s$" % (trailing_slash()),
            self.wrap_view('gather_steamies'),
            name="api_get_steamies"),
        ]

    def gather_steamies(self, request, **kwargs):
        try:
            bundle = self.build_bundle(data={'pk': kwargs['pk']},
                                       request=request)
            obj = self.cached_obj_get(
                bundle=bundle,
                **self.remove_api_resource_names(kwargs))
        except ObjectDoesNotExist:
            return HttpGone()
        # except MultipleObjectsReturned:
        #     return HttpMultipleChoices(
        #             "More than one resource is found at this URI")

        steamies_resource = SteamiesResource()
        return steamies_resource.get_list(request,
                                          top_level_id=obj.pk)


    class Meta(CommonOpenResourceMeta):
        queryset = TopLevelGeo.objects.all()
        resource_name = 'network'
        limit = 20
        fields = ['us_state',
                  'us_district',
                  'us_district_ordinal',
                  'us_bool',
                  'country',
                  'steamies',
                  'work_in_education',
                  'work_in_research',
                  'work_in_political',
                  'work_in_industry',]


class SteamiesResource(ModelResource):
    """
    Returns Steamie objects to NetworkResource
    to fill out the network diagram with user
    information.
    """   
    institution = fields.ForeignKey(
        InstitutionResource,
        'institution',
        null=True,
        full=True)
    individual = fields.ForeignKey(
        IndividualResource,
        'individual',
        null=True,
        full=True)

    class Meta(CommonOpenResourceMeta):
        queryset = Steamies.objects.all()
        limit = 20
        fields = ['description',
                  'institution',
                  'individual',
                  'avatar_url',
                  'work_in',]


class AuthedInstitutionResource(ModelResource):
    """
    Returns Institution objects to AuthSteamieResource
    to fill out a users profile
    """
    class Meta(CommonOpenResourceMeta):
        queryset = Institution.objects.all()


class AuthedIndividualResource(ModelResource):
    """
    Returns Institution objects to AuthSteamieResource
    to fill out a users profile
    """
    class Meta(CommonOpenResourceMeta):
        queryset = Individual.objects.all()


class UserResource(ModelResource):
    """
    Returns User objects to AuthSteamieResource
    """
    class Meta(CommonOpenResourceMeta):
        queryset = User.objects.all()
        # excludes = ['id', 'is_active', 'is_staff',
        #             'is_superuser', 'date_joined']


class AuthSteamieResource(ModelResource):
    """
    Used to manage Steamie models.
    Including their Individual and Institution models.
    """
    user = fields.ForeignKey(
        UserResource,
        'user',
        null=True,
        full=True)
    institution = fields.ForeignKey(
        AuthedInstitutionResource,
        'institution',
        null=True,
        full=True)
    individual = fields.ForeignKey(
        AuthedIndividualResource,
        'individual',
        null=True,
        full=True)
    top_level = fields.ForeignKey(
        TopLevelGeoResource,
        'top_level',
        null=True,
        full=True)

    class Meta(CommonAuthResourceMeta):
        queryset = Steamies.objects.all()
        resource_name = 'steamie'
        limit = 1

    def obj_create(self, bundle, **kwargs):
        # sets user based on request to
        # ensure auth passes
        # http://django-tastypie.readthedocs.org/
        #     en/latest/cookbook.html#creating-per-user-resources
        return super(AuthSteamieResource, self)\
            .obj_create(bundle, user=bundle.request.user)

    def apply_authorization_limits(self, request, object_list):
        object_list.filter(user=request.user)
