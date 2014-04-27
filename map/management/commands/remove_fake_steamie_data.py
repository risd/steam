"""
Remove the fake data from the map.

Depends on having the database having
TopLevelGeo instances to tie each
STEAMie to. Run to set that up:

python manage.py populate_toplevelgeo.py
"""
from django.core.management.base import BaseCommand

from ...models import Steamies

class Command(BaseCommand):
    args = 'None'
    help = 'Remove fake STEAMie data.'

    def handle(self, *args, **options):
        print "Removing STEAMies fake steamies.\n" +\
            "These are STEAMies tagged with `fake`\n\n"

        fake_steamies = Steamies.objects.filter(tags='fake')

        fake_steamie_count = fake_steamies.count()
        print "Fake steamies found: {0}".format(fake_steamie_count)

        print "Deleting."
        fake_steamies.delete()

        print "Ensuring they are gone."
        fake_steamies = Steamies.objects.filter(tags='fake')

        print "Fake steamies found: {0}".format(fake_steamies.count())
