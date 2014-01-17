# Used as a signal on save of the Steamie models
# Since geo data is being pushed from the user
# to server as zip codes, this will tap into the
# the Sunlight Congress API or pyGeocoder (google
# maps powered) in order to get back metadata
# to tie that zip_code to a particular
# instance of TopLevelGeo

# lat lon will never actually be used.
# items will be aggregated by
#   zipcode (polygon)
#   level_1 (point)

import re

from sunlight import congress
import us


class Geo():
    """Construct for dealing with zipcode data"""
    def __init__(self):
        # ordinal works for 68 characters.
        # we only need 1-53, so this will do
        # http://codegolf.stackexchange.com/
                # questions/4707/outputting-ordinal-
                # numbers-1st-2nd-3rd#answer-4712
        self._digits = re.compile('\d')
        self._ordinal =\
            lambda n: "%d%s" %\
                (n,"tsnrhtdd"[(n/10%10!=1)*(n%10<4)*n%10::4])

    def geo(self, top_level_input):
        """
        Need to determine how we are going to get the 
        verbose name "Washington 6th District". That is
        what should be captured in top_level

        Then points should be aggregated on top_level,
        into representative numbers for edu, ind, pol, and
        'res' (per fake_level_1_pnt.geojson)

        @param zip_code : the zip in question

        @return geo : {} **kwargs of variables to compare
                         against TopLevelGeo.
                           
        """

        if self._digits.search(top_level_input):
            # it has digits, presumably this is a zipcode

            district = congress.\
                            locate_districts_by_zip(
                                zipcode=top_level_input)

            if (len(district) > 0):
                # you got something back!
                geo = {
                    'us_bool': True,
                    'us_state_abbr': district[0][u'state'],
                    'us_state':\
                        getattr(us.states, district[0][u'state']).name,
                    'us_district': district[0][u'district'],
                    'us_district_ordinal':\
                        self._ordinal(int(district[0][u'district'])),
                }
        else:
            geo = {
                'us_bool': False,
                'country': top_level_input
            }

        return geo

if __name__ == '__main__':
    g = Geo()
    wyoming = g.geo('82073')
    print wyoming
    ri = g.geo('02906')
    print ri
    assert (ri.get(u'us_bool') == True)
    assert (ri.get(u'us_state') == u'Rhode Island')
    assert (ri.get(u'us_district') == 1)
    strehla_germany = g.geo('Germany')
    print strehla_germany
    assert (ri.get(u'country') == u'Germany')
    assert (ri.get(u'us_bool') == False)
