from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api

from .resources import AuthSteamieResource
from .resources import GeoResource
from .resources import NetworkResource

v1_api = Api(api_name='v1')
v1_api.register(AuthSteamieResource())
v1_api.register(GeoResource())
v1_api.register(NetworkResource())

urlpatterns = patterns(
    '',

    # map
    url(r'^$',
        'backend.views.map',
        name='map'),

    # final step of log in, redirects to front end
    url(r'logged-in/$',
        'backend.views.logged_in',
        name='logged_in'),

    # if something goes wrong in log in process
    url(r'login-error/$',
        'backend.views.login_error',
        name='login_error'),

    url(r'api/', include(v1_api.urls)),

    url(r'', include('social_auth.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
