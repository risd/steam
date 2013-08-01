from django.core.management.base import BaseCommand, CommandError

from ...models import Individual, Institution, Initiative


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Delete all Individual, Institution and Initiative data.'

    def handle(self, *args, **kwargs):
        try:
            Initiative.objects.all().delete()
            Institution.objects.all().delete()
            Initiative.objects.all().delete()

        except CommandError as detail:
            print 'Error deleting data! ' +\
                '{0}'.format(detail)
