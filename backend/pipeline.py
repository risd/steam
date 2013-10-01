# Pipeline processing

from social_auth.backends.facebook import FacebookBackend
from social_auth.backends.twitter import TwitterBackend
from social_auth.backends.google import GoogleOAuth2Backend

from .models import Steamies


def create_steamie(request, user, *args, **kwargs):
    """Create Steamie. Depends on create_user"""

    print "\n\n creating steamie \n\n"

    if user is None:
        # for unauthed requests
        return

    steamie, created = Steamies.objects.get_or_create(
        user=user)

    return {'steamie': steamie}


def get_avatar_url(request, backend, response, steamie, *args, **kwargs):
    """
    depends on having had created a Steamie object.
    """
    print "\n\n getting avatar url"

    avatar_url = ''
    if isinstance(backend, FacebookBackend):
        avatar_url = 'http://graph.facebook.com/%s/picture?type=small' \
            % response['id']

        print "facebook"

    elif isinstance(backend, TwitterBackend):
        avatar_url = response.get('profile_image_url', '')

        print "twitter"

    elif isinstance(backend, GoogleOAuth2Backend):
        print "google"

    else:
        avatar_url = 'http://default/avatar'

    steamie.avatar_url = avatar_url
    steamie.save()
