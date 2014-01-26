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
    args = '<scope: us/world>'
    help = 'Populate fake STEAMie data. '

    def handle(self, *args, **options):
        print args

        f = Faker()
        TLGs = TopLevelGeo.objects.all()

        total_count = 0
        for tlg in TLGs:

            for count in range(random.randint(5, 10)):
                steamie = Steamies()
                steamie.top_level = tlg
                # default twitter avatar
                steamie.avatar_url =\
                    "http://a0.twimg.com/sticky/" +\
                    "default_profile_images/" +\
                    "default_profile_6_normal.png"

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
                    steamie.individual.save()

                else:
                    if random.random() > 0.5:
                        institution = {
                            'name': f.company(),
                            'representative_first_name':\
                                f.first_name(),
                            'representative_last_name':\
                                f.last_name(),
                            'representative_email':\
                                f.email(),
                        }
                    else:
                        institution = {}

                    steamie.institution = Institution(**institution)
                    steamie.institution.save()

                try:
                    steamie.tags = 'fake'
                    steamie.save()
                    total_count += 1
                    if total_count < 10:
                        print "edu pol res ind"
                        print " {0}   {1}   {2}   {3}".format(
                            steamie.top_level.work_in_education,
                            steamie.top_level.work_in_political,
                            steamie.top_level.work_in_research,
                            steamie.top_level.work_in_industry)

                    print "Saved: {0}".format(steamie.top_level)

                except CommandError as detail:
                    print 'Error creating data! ' +\
                            '{0}'.format(detail)

        print "Created {0} Steamie models".format(total_count)
