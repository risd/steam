from django.core.management.base import BaseCommand, CommandError

from ...models import TumblFeature, TumblEvent


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Delete all Individual, Institution and Initiative data.'

    def handle(self, *args, **kwargs):
        try:

            print 'Deleting Tumblr Feature models'
            TumblFeature.objects.all().delete()

            print 'Deleting Tumblr Event models'
            TumblEvent.objects.all().delete()

        except CommandError as detail:
            print 'Error deleting data! ' +\
                '{0}'.format(detail)
