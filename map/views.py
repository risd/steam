from django.shortcuts import render
from django.shortcuts import redirect
from django.views.decorators.csrf import ensure_csrf_cookie


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
