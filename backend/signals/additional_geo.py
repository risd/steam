# Geo data started as zipcodes.tsv. lat,lon,zipcode
# This adds level_1 information. Either US State
# or country. So that information can also be added
# to the model.

from os import path
import time

from pygeocoder import Geocoder

# path to original tsv with lat/lon for each zipcode
DEFAULT_ZIPCODE_FILE = \
    path.join(path.dirname(path.abspath(__file__)), 'zipcodes.tsv')

# path to file with geo data for this application
DEFAULT_GEO_FILE = \
    path.join(path.dirname(path.abspath(__file__)), 'geo.tsv')


class AdditionalGeo():
    """Construct for dealing with zipcode data"""
    def __init__(self,
                 in_filepath=DEFAULT_ZIPCODE_FILE,
                 out_filepath=DEFAULT_GEO_FILE):

        self.geo = self._prep(in_filepath)

    def _prep(self, filepath):
        # get all of the initial data in
        geo_list = []

        count = 0
        with open(filepath, 'r') as f:
            raw = f.read()
            raw_lines = raw.split('\n')
            for line in raw_lines:
                count += 1
                # skip the first line
                if count == 1:
                    continue

                # lon,lat,zip
                split_data = line.strip().split('\t')
                if len(split_data) == 3:
                    geo = {}
                    geo['lon'] = split_data[0]
                    geo['lat'] = split_data[1]

                    geo.update(self.add_level_1(split_data[2]))

                    geo_list.append(geo)

                # geocoder needs time between requests
                time.sleep(0.3)

        return geo_list

    def add_level_1(self, zip_code):
        # original file starts with lat, lon and zip code
        # this will add state or country
        geo = {}
        try:
            geocoded = Geocoder.geocode(zip_code)
        except:
            geo = {'error': 'could not be geocoded'}
        else:
            # level_1 region is either a state, or the country
            # if it happens to be outside of the US
            if geocoded[0].country == 'United States':
                geo['us_bool'] = True
                geo['level_1'] = geocoded[0].administrative_area_level_1
            else:
                geo['us_bool'] = False
                geo['level_1'] = geocoded[0].country

        return geo

    def write(self, filepath=DEFAULT_GEO_FILE):
        with open(filepath, 'w') as f:
            # first the heading
            f.write('lon\tlat\tzip\tlevel_1\tus_bool\n')

            for location in self.geo:
                new_line = '{0}\t'.format(location['lon']) +\
                           '{0}\t'.format(location['lat']) +\
                           '{0}\t'.format(location['level_1']) +\
                           '{0}'.format(location['us_bool'])

                f.write('{0}\n'.format(new_line))

if __name__ == '__main__':
    additional_geo = AdditionalGeo()
    additional_geo.write()
