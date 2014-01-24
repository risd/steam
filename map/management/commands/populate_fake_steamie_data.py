"""
Put some fake data into the database to
enable the front end to display something.

Depends on having the database having
TopLevelGeo instances to tie each
STEAMie to. Run to set that up:

python manage.py populate_toplevelgeo.py
"""
import random

from django.core.management.base import BaseCommand, CommandError

from ...models import Steamies, Individual, Institution, TopLevelGeo

from faker import Faker


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Populate fake STEAMie data.'

    def handle(self, *args, **kwargs):
        f = Faker()
        TLGs = TopLevelGeo.objects.all()

        for tlg in TLGs:

            # stash steamies for bulk save
            # pre_ and post_save signals will
            # not be called, which is fine, since
            # we are doing or own TLG attatchment.
            steamies_for_tlg = []

            for count in range(random.randint(5, 10)):
                steamie = Steamies()
                steamie.top_level = tlg

                # half with description, half not
                if random.random() > 0.5:
                    steamie.description = f.lorem()[:140]

                work_in_options = ['political',
                                   'research',
                                   'education',
                                   'industry']

                steamie.work_in =\
                    work_in_options[\
                        random.randint(0, len(work_in_options)-1)]

                # half institution/half individual
                if random.random() > 0.5:
                    # half empty profiles, half populated
                    if random.random() > 0.5:
                        individual = {
                            'first_name': f.first_name(),
                            'last_name': f.last_name(),
                        }
                    else:
                        individual = {}

                    steamie.individual = Individual(**individual)

                else:
                    if random.random() > 0.5:
                        institution = {
                            'name': f.company(),

                        }
                    else:
                        institution = {}

                    steamie.institution = Institution(**institution)

                steamies_for_tlg.append(steamie)

            try:
                Steamies.objects.builk_create(steamies_for_tlg)

            except CommandError as detail:
                print 'Error creating data! ' +\
                        '{0}'.format(detail)
