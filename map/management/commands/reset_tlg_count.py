"""
Are your TopLevelGeo.work_in_totals
out of wack with your Steamies?

Reset the top_level_geo values
by inspecting all of the steamies
"""

import logging
from django.core.management.base import BaseCommand, CommandError

from ...models import Steamies,\
                      TopLevelGeo

logging.basicConfig()
logger = logging.getLogger(__name__)

def equal_dict(first, second):
    equal = True
    for key, first_value in first.iteritems():
        if first_value != second[key]:
            equal = False
            break
    return equal

class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Reset all of the TopLevelGeo counts based on Steamies.'

    def handle(self, *args, **kwargs):
        logger.info('Worker - Reset TLG Count started.')
        try:
            tlgs = TopLevelGeo.objects.all()
            for tlg in tlgs:
                count = {
                    'work_in_education': 0,
                    'work_in_industry' : 0,
                    'work_in_political': 0,
                    'work_in_research' : 0,
                }

                steamies = Steamies.objects.filter(top_level=tlg)
                for steamie in steamies:
                    work_in_field = 'work_in_{0}'.format(steamie.work_in)
                    count[work_in_field] += 1

                if not equal_dict(count, tlg.work_in_dict()):
                    msg = 'Hard reset values on '+\
                          '{0}'.format(tlg.pk)
                    logger.info(msg)
                    logger.info("{:<19} {:<8} {:<8}".format('',
                                                            'Counted',
                                                            'In model'))
                    for key, counted_value in count.iteritems():
                        logger.info("{:<19} {:<8} {:<8}".format(
                                    key,
                                    counted_value,
                                    tlg.work_in_dict()[key]))

                    TopLevelGeo.objects\
                        .filter(pk=tlg.pk)\
                        .update(**count)

            logger.info('Worker - Reset TLG Count finished.')

        except CommandError as detail:
            logger.error('Error resetting values data! ' +\
                         '{0}'.format(detail))
