from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api

from .resources import InstitutionResource, IndividualResource

v1_api = Api(api_name='v1')
v1_api.register(IndividualResource())
v1_api.register(InstitutionResource())

urlpatterns = patterns(
    '',
    # Examples:
    url(r'^$', 'backend.views.home', name='home'),
    # url(r'^backend/', include('backend.foo.urls')),
    url(r'api/', include(v1_api.urls)),

    url(r'logged-in/',
        'backend.views.auth_test',
        name='logged-in'),

    url(r'', include('social_auth.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
