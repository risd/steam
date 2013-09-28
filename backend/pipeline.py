# Pipeline processing

from .models import Steamies


def create_steamie(request, user, *args, **kwargs):
    """Create Steamie. Depends on create_user"""

    if user is None:
        # for unauthed requests
        return

    steamie, created = Steamies.objects.get_or_create(
        user=user)

    if created:
        print "\n\nCreated new user\n\n"
    else:
        print "\n\nReusing existing steamie\n\n"

    print steamie.user

    return {'steamie': steamie}
