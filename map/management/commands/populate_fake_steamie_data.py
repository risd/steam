"""
Put some fake data into the database to
enable the front end to display something.

Depends on having the database having
TopLevelGeo instances to tie each
STEAMie to. Run to set that up:

python manage.py populate_toplevelgeo.py
"""
import random

from django.core.management.base import BaseCommand

from ...models import Steamies, Individual, Institution, TopLevelGeo

from faker import Faker


class Command(BaseCommand):
    args = '<scope: us/world>'
    help = 'Populate fake STEAMie data. '

    hotspots = ['Rhode Island 1st District',
                'New York 12th District',
                'Illinois 7th District',
                'California 8th District']

    def not_hotspot():
        return range(random.randint(5,10))
    def hotspot():
        return range(random.randint(1300, 1600))


    ranges = {
        'hotspot': hotspot,
        'not_hotspot': not_hotspot,
    }

    def handle(self, *args, **options):
        print args

        f = Faker()
        TLGs = TopLevelGeo.objects.all()

        total_count = 0
        for tlg in TLGs:

            cur_type = 'not_hotspot'
            if str(tlg) in self.hotspots:
                cur_type = 'hotspot'

            for count in self.ranges[cur_type]():
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
                    ind = Individual(
                        first_name=f.first_name(),
                        last_name=f.last_name())
                    ind.save()

                    steamie.individual = ind
                    steamie.tags = 'fake'
                    steamie.save()
                    print steamie.individual

                else:
                    ins = Institution(
                        name=f.company(),
                        representative_first_name=f.first_name(),
                        representative_last_name=f.last_name(),
                        representative_email=f.email())
                    ins.save()

                    steamie.institution = ins
                    steamie.institution.save()
                    steamie.tags = 'fake'
                    steamie.save()
                    print steamie.institution

            total_count += 1
            print "edu pol res ind"
            print " {0}   {1}   {2}   {3}".format(
                steamie.top_level.work_in_education,
                steamie.top_level.work_in_political,
                steamie.top_level.work_in_research,
                steamie.top_level.work_in_industry)
            # if total_count > 5:
            #     break

            print "Saved: {0}".format(steamie.top_level)

        print "Created Steamie models for {0}".format(total_count) +\
              " locations"
