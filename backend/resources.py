from tastypie.authentication import Authentication
from tastypie.authentication import SessionAuthentication

from tastypie.authorization import Authorization
from tastypie.authorization import DjangoAuthorization

from tastypie.resources import ModelResource, ALL_WITH_RELATIONS

from tastypie.serializers import Serializer


from .models import Institution, Individual


class CommonOpenResourceMeta:
    """
    Open resources will sublcass this.
    """
    authentication = Authentication()
    authorization = Authorization()

    serializer = Serializer(formats=['json', 'jsonp'])
    allowed_methods = ['get', 'post']

    always_return_data = True


class CommonAuthResourceMeta:
    """
    Auth resources will subclass this.
    """
    authentication = SessionAuthentication()
    authorization = DjangoAuthorization()

    serializer = Serializer(formats=['json', 'jsonp'])
    allowed_methods = ['get', 'post', 'delete']

    always_return_data = True


class CountResource(ModelResource):
    """
    Returns geojson of top_level steaminess
    steaminess is the count of individual
    and institution steamies. Broken down
    by their 'work in' field
    """
    class Meta(CommonOpenResourceMeta):

        queryset = Institution.objects.all()
        resource_name = 'institution'
        filtering = {
            'user': ALL_WITH_RELATIONS
        }


class IndividualResource(ModelResource):
    """
    Open resource. Anyone can POST to this.
    Used to GET all user data to start app.
    """
    class Meta(CommonOpenResourceMeta):
        authentication = Authentication()

        queryset = Individual.objects.all()
        resource_name = 'individual'


class AuthInstitutionResource(ModelResource):
    """
    This resource requires authentication.
    """
    class Meta:
        queryset = Institution.objects.all()
        resource_name = 'auth/institution'


class AuthIndividualResource(ModelResource):
    """
    This resource requires authentication.
    """
    class Meta:
        queryset = Individual.objects.all()
        resource_name = 'auth/individual'

