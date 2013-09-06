import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect


def map(request):
    return render(request, 'map.html')


def logged_in(request):
    print '\n\n session'
    print request.session
    print request.session.keys()

    print '\n\n Cookies'
    print request.COOKIES

    print '\n\n request.user'
    print request.user
    print request.user.id
    print request.user.is_authenticated()

    return render(request, 'logged_in.html')


def authed(request):

    print '\n\n session'
    print request.session
    print request.session.keys()
    print '\n\n'

    if request.user.is_authenticated():
        data = {
            'authenticated': 1,
            'uid': request.session.get('_auth_user_id'),
        }
    else:
        data = {
            'authenticated': 0,
        }

    response = HttpResponse(
        json.dumps(data),
        content_type='application/json')

    response['Status Code'] = 200

    return response
