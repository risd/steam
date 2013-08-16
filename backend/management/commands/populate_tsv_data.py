# Populates database based on TSV

import codecs
import json
import random
import time

from pygeocoder import Geocoder

from django.core.management.base import BaseCommand, CommandError

from ...models import Individual, Institution, Initiative


class SteamData():
    """
    deal with steam data
    """

    _default_schema = {
        'properties': {
            'noteworthy': 0,
            'last_name': 1,
            'first_name': 2,
            'organization': 3,
            'phone': 4,
            'email': 5,
            'city': 6,
            'state': 7,
            'country': 8,
            'affiliation': 9,
            'type': 10,
            'tags': 11,
            'description': False,
            'link': 13,
            'on_map': 14,
            'private_public': 15,
            'relationship': 16,
            'list_type': 17,
        }
    }

    def __init__(self, filepath, schema=_default_schema):
        self.filepath = filepath

        self.schema = schema

        self.data = self.import_from_file(self.filepath)

    def geocode(self, fields):
        city = fields[
            self.schema['properties']['city']
        ].strip()

        state = fields[
            self.schema['properties']['state']
        ].strip()

        country = fields[
            self.schema['properties']['country']
        ].strip()

        location = ''
        if city and state and country:
            location = "{0}, {1}, {2}".format(city, state, country)
        elif state and country:
            location = "{0}, {1}".format(state, country)
        elif country:
            location = "{0}".format(country)
        else:
            return None

        if len(location):
            results = Geocoder.geocode(location)
        else:
            return None

        print "\n\n{0}".format(location)
        print "{0}\n\n".format(results[0])

        us_bool = False
        us_state = False

        if results[0].country == 'United States':
            us_bool = True
            us_state = results[0].administrative_area_level_1

        return {
            'lat': results[0].coordinates[0],
            'lon': results[0].coordinates[1],
            'us_bool': us_bool,
            'us_state': us_state
        }

    def import_from_file(self, filepath):
        collection = []
        with codecs.open(filepath, 'r', 'utf-8') as raw_data:
            count = 0
            for line in raw_data:
                count += 1

                if count == 1:
                    # skip the first line
                    continue

                # if count > 5:
                    # test rest of script
                    # continue

                fields = line.split('\t')

                # every new line is a new feature
                feature = {}

                geo = self.geocode(fields)

                if not geo:
                    continue

                feature['lat'] = geo['lat']
                feature['lon'] = geo['lon']
                feature['us_bool'] = geo['us_bool']
                feature['us_state'] = geo['us_state']

                for prop in self.schema['properties']:
                    if self.schema['properties'][prop]:
                        feature[prop] = \
                            fields[
                                self.schema['properties'][prop]
                            ].strip()
                    else:
                        feature[prop] = ''

                collection.append(feature)

        return collection


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Populate data from STEAM google docs. ' +\
        'Some random data included in fields that are' +\
        ' not covered in the tsv.'

    def handle(self, *args, **kwargs):
        steam = SteamData('STEAM All - STEAM All.tsv')

        for datum in steam.data:
            subscribe_email = True if random.random() > 0.5 else False
            try:
                new_entry = Individual()

                print 'Individual'
                new_entry = Individual()
                new_entry.description = 'test description'
                new_entry.email = datum['email']
                new_entry.email_subscription = subscribe_email

                new_entry.engaged_as = \
                    datum['type']

                new_entry.first_name = \
                    datum['first_name']

                new_entry.last_name = datum['last_name']

                new_entry.latitude = datum['lat']
                new_entry.longitude = datum['lon']
                new_entry.us_bool = datum['us_bool']
                new_entry.us_state = datum['us_state']

                # no zipcode, so drop a blank thing
                # in there, so the post_save
                # signal doesn't die on you.
                new_entry.zipcode = ''

                # new_entry.save()
                print "\n\nnew entry"
                print new_entry
                print "\n\n"

            except CommandError as detail:
                print 'Error creating data! ' +\
                    '{0}'.format(detail)

            time.sleep(0.2)
