import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Steamies, Individual, Institution
from .urls import v1_api


@ensure_csrf_cookie
def map(request):
    """
    Directs request to the map application.
    """
    return render(
        request,
        'map.html',
        {
            'backend': request.get_host(),
            'api_version': v1_api.api_name
        })


def logged_in(request):
    """
    Redirect after social authentication login.
    Used to simply close the dialog box that pops up.
    """
    print '\n\n session'
    print request.session
    print request.session.keys()

    print '\n\n Cookies'
    print request.COOKIES

    print '\n\n request.user'
    print request.user
    print request.user.id
    print request.user.is_authenticated()

    return render(request, 'redirected.html')


def login_error(request):
    """
    Redirect after social authentication login fails.
    Used to simply close the dialog box that pops up.
    """
    return render(request, 'redirected.html')
