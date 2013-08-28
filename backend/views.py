from django.http import HttpResponse
from django.shortcuts import render

import sys


def home(request):
    print >>sys.stderr, '\n\nboom\n\n'
    return HttpResponse('<h1>hello</h1>')


def auth_test(request):
    return render(request,
                  'auth.html',
                  {},
                  content_type="text/html")


def logged_in(request):

    print >>sys.stderr, '\n\n{0}'.format(request.session)
    print >>sys.stderr, '{0}\n\n'.format(request.session.keys())
    print >>sys.stderr, '{0}\n\n'.format(
        request
        .session
        .get('_auth_user_id'))

    user_id = request.session.get('_auth_user_id')

    print >>sys.stderr, '\n\n{0}'.format(request.user)
    print >>sys.stderr, '{0}'.format(request.user.__dict__)
    print >>sys.stderr, '{0}'.format(request.user.first_name)
    print >>sys.stderr, '{0}'.format(request.user.last_name)
    print >>sys.stderr, '{0}'.format(request.user.email)
    print >>sys.stderr, '{0}\n\n'.format(request.user.id)

    return render(request,
                  'auth.html',
                  {'user_id': user_id},
                  content_type='text/html')
