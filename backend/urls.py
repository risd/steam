from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api

from map.resources import AuthSteamieResource
from map.resources import NetworkResource
from map.resources import TopLevelGeoResource

from news.resources import HashTweetResource
from news.resources import NewsTumblResource
from news.resources import NewsResource
from news.resources import AnnounceTumblResource

v1_api = Api(api_name='v1')
v1_api.register(AuthSteamieResource())
v1_api.register(NetworkResource())
v1_api.register(TopLevelGeoResource())

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

    url(r'map/logout/$',
        'map.views.log_out',
        name='log_out'),

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
    # url(r'^admin/', include(admin.site.urls)),

    # root
    url(r'^$',
        'map.views.map',
        name='map_index'),

    # CSV data
    url(r'spreadsheet/individual/$',
        'map.views.spreadsheet_individual',
        name="map_spreadsheet_individual"),

    url(r'spreadsheet/institution/$',
        'map.views.spreadsheet_institution',
        name="map_spreadsheet_institution"),
)
