# Used as a signal on save of the Steamie models
# Since geo data is being pushed from the user
# to server as zip codes, this will tap into the
# zip codes file to see if the user supplied
# a US zip code. If so, it return lat/lon for
# that zipcode, and the state. If not,
# returns lat lon and the country.

# lat lon will never actually be used.
# items will be aggregated by
#   zipcode (polygon)
#   level_1 (point)

from os import path
from pygeocoder import Geocoder

# path to file with geo data for this application
DEFAULT_GEO_FILE = \
    path.join(path.dirname(path.abspath(__file__)), 'geo.tsv')


class Geo():
    """Construct for dealing with zipcode data"""
    def __init__(self, filepath=DEFAULT_GEO_FILE):
        self.by_zip = self._prep(filepath)

    def _prep(self, filepath):
        zip_codes = {}

        count = 0
        with open(filepath, 'r') as f:
            raw = f.read()
            raw_lines = raw.split('\n')
            for line in raw_lines:
                count += 1
                # skip the first line
                if count == 1:
                    continue

                # lon,lat,zip,level_1,us_bool
                split_data = line.strip().split('\t')
                if len(split_data) == 3:
                    geo = {}
                    geo['lon'] = split_data[0]
                    geo['lat'] = split_data[1]
                    geo['level_1'] = split_data[3]
                    geo['us_bool'] = split_data[4]

                    zip_codes[split_data[2]] = geo

        return zip_codes

    def geo(self, zip_code):
        geo = {}

        if zip_code in self.by_zip.keys():
            geo = self.by_zip[zip_code]
        else:
            try:
                geocoded = Geocoder.geocode(zip_code)
            except:
                geo = {'error': 'could not be geocoded'}
            else:
                geo = {}
                geo['lon'] = geocoded[0].coordinates[1]
                geo['lat'] = geocoded[0].coordinates[0]

                if geocoded[0].country == 'United States':
                    geo['us_bool'] = True
                    geo['level_1'] = \
                        geocoded[0].administrative_area_level_1

                else:
                    # should always be coming through here,
                    # since the list has all US zip codes.
                    geo['us_bool'] = False
                    geo['level_1'] = geocoded[0].country

        return geo
