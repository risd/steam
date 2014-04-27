"""
Put some data into the database to
enable the front end to display something.

Depends on having the database having
TopLevelGeo instances to tie each
STEAMie to. Run to set that up:

python manage.py populate_toplevelgeo.py
"""
import logging

from django.conf import settings
from django.db.models import Q
from django.core.management.base import BaseCommand, CommandError

from ...models import TopLevelGeo

import geojson
import boto
from boto.s3.key import Key

logging.basicConfig()
logger = logging.getLogger(__name__)

s3 = boto.connect_s3(settings.AWS_KEY, settings.AWS_SECRET_KEY)
bucket = s3.get_bucket('steammap')


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
            k = Key(bucket)
            k.key = 'geo/top_level_geo.json'
            k.set_contents_from_string(geojson.dumps(gj))

            
            logger.info('Wrote new top_level_geo.geojson file. '+\
                        '{0} features.'.format(len(features)))

        except CommandError as detail:
            err = 'Error writing data! ' +\
                    '{0}'.format(detail)
            logger.error(err)
