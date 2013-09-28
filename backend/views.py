import json

from django.shortcuts import render
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth.models import User

from .models import Steamies, Individual, Institution


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

    print 'user'
    print request.user
    print request.user.__dict__
    print '\n\n'

    # initialize response with default data
    # about the user.
    data = {
        'authenticated': 0,  # tracks whether they have ever signed in
        'type': 0            # tracks type (individual/institution)
    }
    if request.user.is_authenticated():
        if '_auth_user_id' in request.session.keys():
            uid = int(request.session.get('_auth_user_id'))
            u = User.objects.get(id=uid)
            steamie = Steamies.objects.get(user=u)

            steamie_type = ''
            if steamie.individual:
                steamie_type = 'individual'
            elif steamie.institution:
                steamie_type = 'institution'

            data = {
                'authenticated': 1,
                'type': steamie_type,
            }

    response = HttpResponse(
        json.dumps(data),
        content_type='application/json')

    response['Status Code'] = 200

    return response
