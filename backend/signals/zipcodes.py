from os import path
from pygeocoder import Geocoder

DEFAULT_ZIPCODE_FILE = \
    path.join(path.dirname(path.abspath(__file__)), 'zipcodes.tsv')


class Zipcode():
    """Construct for dealing with zipcode data"""
    def __init__(self, filepath=DEFAULT_ZIPCODE_FILE):
        self.zipcodes = self._prep(filepath)

    def _prep(self, filepath):
        zipcodes = {}

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
                    zipcodes[split_data[2]] = geo
        return zipcodes

    def geo(self, zipcode):
        if zipcode in self.zipcodes.keys():
            return self.zipcodes[zipcode]
        else:
            try:
                geocoded = Geocoder.geocode(zipcode)
            except:
                geo = {'error': 'could not be geocoded'}
            else:
                geo = {}
                geo['lon'] = geocoded[0].coordinates[1]
                geo['lat'] = geocoded[0].coordinates[0]

            return geo
