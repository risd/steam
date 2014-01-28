# Pipeline processing
import logging

from social.backends.facebook import FacebookAppOAuth2
from social.backends.twitter import TwitterOAuth
from social.backends.google import GoogleOAuth2

from .models import Steamies

logging.basicConfig()
logger = logging.getLogger(__name__)


def create_steamie(request, user, *args, **kwargs):
    """Create Steamie. Depends on create_user"""
    print "create steamie"

    if user is None:
        # for unauthed requests
        return

    steamie, created = Steamies.objects.get_or_create(
        user=user)

    logger.info('Authenticated. Created?: {0}'.format(created))

    return {'steamie': steamie}


def extra_data(request,
                   backend,
                   response,
                   steamie, *args, **kwargs):
    """
    depends on having had created a Steamie object.
    """

    avatar_url = ''
    details = None

    if isinstance(backend, FacebookAppOAuth2):
        avatar_url = 'http://graph.facebook.com/%s/picture?type=small' \
            % response['id']

        details = FacebookAppOAuth2.get_user_details(response)

        logger.info("Authenticated. Facebook.")

    elif isinstance(backend, TwitterOAuth):
        avatar_url = response.get('profile_image_url', '')

        details = TwitterOAuth.get_user_details(response)

        logger.info("Authenticated. Twitter.")

    elif isinstance(backend, GoogleOAuth2):
        size = 60
        # https://gist.github.com/jcsrb/1081548
        avatar_url = "http://profiles.google.com/s2/photos/profile/" +\
            response['id'] + "?sz=" + size;

        details = GoogleOAuth2.get_user_details(response)

        logger.info("Authenticated. Google.")

    else:
        avatar_url = 'http://default/avatar'

    if details:
        steamie.user.first_name = details['first_name']
        steamie.user.last_name = details['last_name']
        steamie.user.email = details['email']
        steamie.user.save()

    steamie.avatar_url = avatar_url
    steamie.save()
