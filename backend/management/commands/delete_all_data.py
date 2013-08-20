from django.core.management.base import BaseCommand, CommandError

from ...models import Individual, Institution, Initiative


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Delete all Individual, Institution and Initiative data.'

    def handle(self, *args, **kwargs):
        try:
            print 'Deleting Initiative models'
            Initiative.objects.all().delete()

            print 'Deleting Institution models'
            Institution.objects.all().delete()

            print 'Deleting Individual models'
            Individual.objects.all().delete()

        except CommandError as detail:
            print 'Error deleting data! ' +\
                '{0}'.format(detail)
