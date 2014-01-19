from django.core.management.base import BaseCommand, CommandError

from django.contrib.auth.models import User
from social_auth.db.django_models import UserSocialAuth, Association
from ...models import Individual, Institution, Initiative, Steamies


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Delete all Individual, Institution and Initiative data.'

    def handle(self, *args, **kwargs):
        try:
            print 'Deleting User'
            User.objects.filter(id__gte=2).delete()

            print 'Deleting Steamie models'
            Steamies.objects.all().delete()

            print 'Deleting Initiative models'
            Initiative.objects.all().delete()

            print 'Deleting Institution models'
            Institution.objects.all().delete()

            print 'Deleting Individual models'
            Individual.objects.all().delete()

            print 'Deleting UserSocialAuth'
            UserSocialAuth.objects.all().delete()

            print 'Deleting Association'
            Association.objects.all().delete()

        except CommandError as detail:
            print 'Error deleting data! ' +\
                '{0}'.format(detail)
