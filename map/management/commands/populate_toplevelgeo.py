# give the TopLevelGeo all of its possible locations
from os.path import abspath, dirname, join
from django.core.management.base import BaseCommand, CommandError

from ...models import TopLevelGeo

DATA_DIR = join(dirname(abspath(__file__)), 'data')

COUNTRIES = join(DATA_DIR, 'countries_geocoded.tsv')
DISTRICTS = join(DATA_DIR, 'districts_geocoded.tsv')


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Populate TopLevelGeo data.'

    def handle(self, *args, **kwargs):

        tlg_args = []

        with open(COUNTRIES, 'r') as countries_tsv:
            count = 0
            lines = countries_tsv.read().decode('utf8').split('\n')

            for line in lines:
                count += 1
                if count <= 2:
                    # skip heading, and USA
                    continue
                country, lon, lat = line.strip().split('\t')

                tlg_args.append({
                    'country': country,
                    'lon': float(lon),
                    'lat': float(lat),
                    'us_bool': False,
                })

        with open(DISTRICTS, 'r') as districts_tsv:
            count = 0
            lines = districts_tsv.read().decode('utf8').split('\n')

            for line in lines:
                count += 1
                if count <= 1:
                    # skip the heading
                    continue

                us_state, us_state_abbr, us_district,\
                us_district_ordinal, lon, lat = \
                    line.strip().split('\t')

                tlg_args.append({
                    'us_state': us_state,
                    'us_state_abbr': us_state_abbr,
                    'us_district': int(us_district),
                    'us_district_ordinal': us_district_ordinal,
                    'lon': float(lon),
                    'lat': float(lat),
                    'us_bool': True,
                })

        try:
            for tlg_arg in tlg_args:
                # after running this realized there
                # is a bulk_create function in django 1.3+
                # the following would be true, if 
                # tlgs = a list of TopLevelGeo objects
                # TopLevelGeo.objects.bulk_create(tlgs)
                tlg = TopLevelGeo(**tlg_arg)
                tlg.save()
            print 'Saved all {0} TLG features'.format(len(tlg_args))

        except CommandError as detail:
            print 'Error creating data! ' +\
                '{0}'.format(detail)
