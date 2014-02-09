# Pipeline processing
import logging

from social.backends.facebook import FacebookOAuth2
from social.backends.twitter import TwitterOAuth
from social.backends.google import GoogleOAuth2

from .models import Steamies

logging.basicConfig()
logger = logging.getLogger(__name__)


def create_steamie(request,
                   backend,
                   response,
                   user,
                   *args,
                   **kwargs):
    """Create Steamie. Depends on create_user"""

    if user is None:
        # for unauthed requests
        return

    steamie, created = Steamies.objects.get_or_create(
        user=user)

    if created:
        avatar_url = ''

        if isinstance(backend, FacebookOAuth2):
            logger.info('facebook response')
            logger.info(response)

            avatar_url = 'http://graph.facebook.com' +\
                '/%s/picture?type=square' \
                % response['id']

            logger.info("Authenticated. Facebook.")

        elif isinstance(backend, TwitterOAuth):
            avatar_url = response.get('profile_image_url', '')

            logger.info("Authenticated. Twitter.")

        elif isinstance(backend, GoogleOAuth2):
            avatar_url = response.get('picture');

            logger.info("Authenticated. Google.")

        steamie.avatar_url = avatar_url
        steamie.save()


    logger.info('Authenticated. Created?: {0}'.format(created))

    return {'steamie': steamie}

    
