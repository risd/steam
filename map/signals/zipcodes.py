from os import path

DEFAULT_ZIPCODE_FILE = \
    path.join(path.dirname(path.abspath(__file__)), 'zipcodes.tsv')


class Zipcodes():
    """Construct for dealing with zipcode data"""
    def __init__(self, filepath=DEFAULT_ZIPCODE_FILE):
        self.zip_codes = self._prep(filepath)

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

                # lon,lat,zip
                split_data = line.strip().split('\t')
                if len(split_data) == 3:
                    geo = {}
                    geo['lon'] = split_data[0]
                    geo['lat'] = split_data[1]
                    zip_codes[split_data[2]] = geo
        return zip_codes
