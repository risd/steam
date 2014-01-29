import logging
import json

from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.views.decorators.csrf import ensure_csrf_cookie

logging.basicConfig()
logger = logging.getLogger(__name__)


@ensure_csrf_cookie
def map(request):
    """
    Directs request to the map application.
    """
    return render(request, 'map/map.html', {})


def logged_in(request):
    """
    Redirect to map. Subsequent call will determine
    state of the application.
    """
    return redirect('map')


def login_error(request):
    """
    Redirect to map. Subsequent call will determine
    state of the application.
    """
    return redirect('map.views.map')

def log_out(request):
    """
    Log the user out. Returns status of log out.
    """
    status = {
        'logged_out': True
    }
    try:
        logout(request)
    except Exception as e:
        err = 'Error logging out. {0}'.format(e)
        logger.info(err)
    finally:
        return HttpResponse(content=json.dumps(status),
                            mimetype='application/json')
