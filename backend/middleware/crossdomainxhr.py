import logging
from django import http

logger = logging.getLogger(__name__)

try:
    from django.conf import settings
    XS_SHARING_ALLOWED_ORIGINS = settings.XS_SHARING_ALLOWED_ORIGINS
    XS_SHARING_ALLOWED_METHODS = settings.XS_SHARING_ALLOWED_METHODS
    XS_SHARING_ALLOWED_HEADERS = settings.XS_SHARING_ALLOWED_HEADERS

    XS_SHARING_ALLOWED_CREDENTIALS = \
        settings.XS_SHARING_ALLOWED_CREDENTIALS

    XS_SHARING_EXEMPT_PATHS = settings.XS_SHARING_EXEMPT_PATHS
except:
    XS_SHARING_ALLOWED_ORIGINS = '*'
    XS_SHARING_ALLOWED_METHODS = ['POST',
                                  'GET',
                                  'OPTIONS',
                                  'PUT',
                                  'DELETE']
    XS_SHARING_ALLOWED_HEADERS = ['Content-Type', '*']
    XS_SHARING_ALLOWED_CREDENTIALS = 'true'


class XsSharingMiddleware(object):
    """
        This middleware allows cross-domain XHR using
        the html5 postMessage API.


        Access-Control-Allow-Origin: http://foo.example
        Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE

        Based on https://gist.github.com/strogonoff/1369619
    """
    def process_request(self, request):

        # /join-us/ will handle this on its own
        if request.path in XS_SHARING_EXEMPT_PATHS:
            return None

        if 'HTTP_ACCESS_CONTROL_REQUEST_METHOD' in request.META:
            response = http.HttpResponse()

            response['Access-Control-Allow-Origin'] = \
                XS_SHARING_ALLOWED_ORIGINS

            response['Access-Control-Allow-Methods'] = \
                ",".join(XS_SHARING_ALLOWED_METHODS)

            response['Access-Control-Allow-Headers'] = \
                ",".join(XS_SHARING_ALLOWED_HEADERS)

            response['Access-Control-Allow-Credentials'] = \
                XS_SHARING_ALLOWED_CREDENTIALS

            return response

        return None

    def process_response(self, request, response):
        # Avoid unnecessary work
        if response.has_header('Access-Control-Allow-Origin'):
            return response

        response['Access-Control-Allow-Origin'] = \
            XS_SHARING_ALLOWED_ORIGINS

        response['Access-Control-Allow-Methods'] = \
            ",".join(XS_SHARING_ALLOWED_METHODS)

        response['Access-Control-Allow-Headers'] = \
            ",".join(XS_SHARING_ALLOWED_HEADERS)

        response['Access-Control-Allow-Credentials'] = \
            XS_SHARING_ALLOWED_CREDENTIALS

        return response
