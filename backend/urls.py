from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api

from map.resources import AuthSteamieResource
from map.resources import GeoResource
from map.resources import NetworkResource

from news.resources import TweetResource
from news.resources import TumblResource
from news.resources import NewsResource

v1_api = Api(api_name='v1')
v1_api.register(AuthSteamieResource())
v1_api.register(GeoResource())
v1_api.register(NetworkResource())

v1_api.register(TweetResource())
v1_api.register(TumblResource())
v1_api.register(NewsResource())

urlpatterns = patterns(
    '',

    # home
    # url(r'^$',
    #     'evergreen.views.home',
    #     name='home'),

    # news
    # url(r'news/$',
    #     'news.views.news',
    #     name='news'),

    # resources
    # url(r'resources/$',
    #     'evergreen.views.resources',
    #     name='resources'),

    # map
    url(r'map/$',
        'map.views.map',
        name='map'),

    # final step of log in, redirects to front end
    url(r'logged-in/$',
        'map.views.logged_in',
        name='logged_in'),

    # if something goes wrong in log in process
    url(r'login-error/$',
        'map.views.login_error',
        name='login_error'),

    url(r'api/', include(v1_api.urls)),

    url(r'', include('social_auth.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
