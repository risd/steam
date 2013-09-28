# Pipeline processing

from .models import Steamies


def get_avatar_url(request, backend, response, *args, **kwargs):
    avatar_url = ''
    if isinstance(backend, FacebookBackend):
        avatar_url = 'http://graph.facebook.com/%s/picture?type=large' \
            % response['id']
    elif isinstance(backend, TwitterBackend):
        avatar_url = response.get('profile_image_url', '')

    request.session['avatar_url'] = avatar_url

    return {'avatar_url': avatar_url}

def create_steamie(request, user, *args, **kwargs):
    """Create Steamie. Depends on create_user"""

    if user is None:
        # for unauthed requests
        return

    steamie, created = Steamies.objects.get_or_create(
        user=user)

    return {'steamie': steamie}
