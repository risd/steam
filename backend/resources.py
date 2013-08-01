from tastypie.resources import ModelResource, ALL_WITH_RELATIONS
from .models import Institution, Individual


class InstitutionResource(ModelResource):
    class Meta:
        queryset = Institution.objects.all()
        resource_name = 'institution'
        filtering = {
            'user': ALL_WITH_RELATIONS
        }


class IndividualResource(ModelResource):
    class Meta:
        queryset = Individual.objects.all()
        resource_name = 'individual'
