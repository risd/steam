import json

from django.http import HttpResponse


def authed(request):

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
