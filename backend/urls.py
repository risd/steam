from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api

from map.resources import AuthSteamieResource
from map.resources import GeoResource
from map.resources import NetworkResource

from news.resources import HashTweetResource
from news.resources import NewsTumblResource
from news.resources import NewsResource
from news.resources import AnnounceTumblResource

v1_api = Api(api_name='v1')
v1_api.register(AuthSteamieResource())
v1_api.register(GeoResource())
v1_api.register(NetworkResource())

v1_api.register(HashTweetResource())
v1_api.register(NewsTumblResource())
v1_api.register(NewsResource())
v1_api.register(AnnounceTumblResource())

urlpatterns = patterns(
    '',

    # email marketing (mailchimp) subscription
    url(r'join-us/$',
        'marketing.views.join_us',
        name='join_us'),

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

    # tastypie api urls
    url(r'api/', include(v1_api.urls)),

    # social auth urls, used to ensure the correct ones are used in JS calls
    url(r'', include('social.apps.django_app.urls', namespace='social')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
