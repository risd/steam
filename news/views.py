# Create your views here.
import json

from django.shortcuts import render

from backend.urls import v1_api
from .resources import TweetResource, TumblResource, NewsResource

from .utils import resource_json


# not tied up in urls.py YET
# how far can we get on gh-pages of steam-proto, using this
# as a backend?
def home(request):
    """
    Request for the home page.

    Returns template rendered that includes
    all of the news information
    """
    # get tweets
    tumbl_json = resource_json(request=request,
                               Resource=TumblResource)

    tweet_json = resource_json(request=request,
                               Resource=TweetResource)

    return render(
        request,
        'news/home.html',
        {
            'backend': request.get_host(),
            'api_version': v1_api.api_name,
            'tumbl_json': tumbl_json,
            'tweet_json': tweet_json
        })
