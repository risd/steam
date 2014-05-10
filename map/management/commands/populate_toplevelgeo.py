# give the TopLevelGeo all of its possible locations
from os.path import abspath, dirname, join
from django.core.management.base import BaseCommand, CommandError

from ...models import TopLevelGeo

DATA_DIR = join(dirname(abspath(__file__)), 'data')

COUNTRIES = join(DATA_DIR, 'countries.tsv')

DISTRICTS = join(DATA_DIR, 'districts.tsv')


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
                if count <= 1:
                    # skip heading, USA isnt in the list
                    continue
                country, lon, lat, minx, miny, maxx, maxy =\
                    line.strip().split('\t')

                tlg_args.append({
                    'country': country,
                    'lon': float(lon),
                    'lat': float(lat),
                    'minx': float(minx),
                    'miny': float(miny),
                    'maxx': float(maxx),
                    'maxy': float(maxy),
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
                us_district_ordinal, lon, lat, minx,\
                miny, maxx, maxy =\
                    line.strip().split('\t')

                tlg_args.append({
                    'us_state': us_state,
                    'us_state_abbr': us_state_abbr,
                    'us_district': int(us_district),
                    'us_district_ordinal': us_district_ordinal,
                    'lon': float(lon),
                    'lat': float(lat),
                    'minx': float(minx),
                    'miny': float(miny),
                    'maxx': float(maxx),
                    'maxy': float(maxy),
                    'us_bool': True,
                })

        count_saved = 0
        count_created = 0
        count_total = 0
        try:
            for tlg_arg in tlg_args:
                # update or create. not in django 1.5,
                # so here is the boilerplate version
                try:
                    if (tlg_arg['us_bool']):
                        tlg = TopLevelGeo.objects.get(
                            us_state=tlg_arg['us_state'],
                            us_district=tlg_arg['us_district'])
                    else:
                        tlg = TopLevelGeo.objects.get(
                            country=tlg_arg['country'])

                    for key, value in tlg_arg.iteritems():
                        setattr(tlg, key, value)
                    tlg.save()
                    print 'Saved:   {0}'.format(tlg)
                    count_saved += 1
                except TopLevelGeo.DoesNotExist:
                    tlg = TopLevelGeo(**tlg_arg)
                    tlg.save()
                    print 'Created: {0}'.format(tlg)
                    count_created += 1
                count_total += 1

            print '\n\nUpdated/Saved\n' +\
                'Saved:   {0}\n'.format(count_saved) +\
                'Created: {0}\n'.format(count_created) +\
                'Total:   {0}\n\n'.format(count_total) +\
                'Saved + created = Total: {0}'.format(
                    ((count_saved + count_created) == count_total))

            # change illinois 7th district:
            #   from:   [-87.73754, 41.87350]
            #   to:     [-87.78754, 41.87900]
            to_move = TopLevelGeo.objects.get(
                us_state='Illinois',
                us_district=7)
            to_move.lon = float(-87.78754)
            to_move.lat = float(41.87900)
            to_move.save()
            print "Maually moved Illinois 7th District"

            # change  canada
            #   from: [-98.40444, 61.46129]
            #   to:   [-98.40444, 52.8]
            to_move = TopLevelGeo.objects.get(country='Canada')
            to_move.lat = float(52.8)
            to_move.save()

            print "\n\nDone!"

        except CommandError as detail:
            print 'Error creating data! ' +\
                '{0}'.format(detail)
