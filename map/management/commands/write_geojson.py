"""
Put some data into the database to
enable the front end to display something.

Depends on having the database having
TopLevelGeo instances to tie each
STEAMie to. Run to set that up:

python manage.py populate_toplevelgeo.py
"""

from django.core.management.base import BaseCommand, CommandError

from ...models import Steamies, TopLevelGeo

import geojson


class Command(BaseCommand):
    args = '<scope: us/world>'
    help = 'Populate fake STEAMie data. '

    def handle(self, *args, **options):
        ss = Steamies.objects.all()
        # {
        #     'tlg_id': { 'education': 0, 'research': 0, ...},
        #     'tlg_id': { 'education': 0, 'research': 0, ...},
        # }
        tlgs = {}
        print "search all steamies"
        for s in ss:
            if s.top_level.pk not in tlgs.keys():
                tlgs[s.top_level.pk] = {
                    'education': 0,
                    'research': 0,
                    'political': 0,
                    'industry': 0,
                }

            tlgs[s.top_level.pk][s.work_in] += 1


        features = []
        try:
            print "get all features for feature collection"
            for tlg_pk in tlgs.keys():
                cur_tlg = TopLevelGeo.objects.get(pk=tlg_pk)
                features.append(cur_tlg.as_feature(**tlgs[tlg_pk]))
            print "create feature collection"
            gj = geojson.FeatureCollection(features)

            print "write feature collection"
            with open('static/geo/top_level_geo.geojson',
                      'w') as gj_out:
                gj_out.write(geojson.dumps(gj))

        except CommandError as detail:
            print 'Error writing data! ' +\
                    '{0}'.format(detail)
