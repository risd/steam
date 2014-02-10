"""
Put some data into the database to
enable the front end to display something.

Depends on having the database having
TopLevelGeo instances to tie each
STEAMie to. Run to set that up:

python manage.py populate_toplevelgeo.py
"""
import logging

from django.db.models import Q
from django.core.management.base import BaseCommand, CommandError

from ...models import TopLevelGeo

import geojson

logging.basicConfig()
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    args = '<scope: us/world>'
    help = 'Populate fake STEAMie data. '

    def handle(self, *args, **options):
        
        features = []
        try:
            tlgs = TopLevelGeo.objects.filter(
                Q(work_in_education__gt=0) |
                Q(work_in_research__gt=0) |
                Q(work_in_industry__gt=0) |
                Q(work_in_political__gt=0))
            for tlg in tlgs:
                features.append(tlg.as_feature())

            print "create feature collection"
            gj = geojson.FeatureCollection(features)

            print "write feature collection"
            with open('static/geo/top_level_geo.geojson',
                      'w') as gj_out:

                gj_out.write(geojson.dumps(gj))

            with open('staticfiles/geo/top_level_geo.geojson',
                      'w') as gj_out:

                gj_out.write(geojson.dumps(gj))

            logger.info('Wrote new top_level_geo.geojson file. '+\
                        '{0} features.'.format(len(features)))

        except CommandError as detail:
            err = 'Error writing data! ' +\
                    '{0}'.format(detail)
            logger.error(err)
