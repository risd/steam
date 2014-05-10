"""
Are your TopLevelGeo.work_in_totals
out of wack with your Steamies?

Reset the top_level_geo values
by inspecting all of the steamies
"""

from django.core.management.base import BaseCommand, CommandError

from ...models import Steamies,\
                      TopLevelGeo


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Reset all of the TopLevelGeo counts based on Steamies.'

    def handle(self, *args, **kwargs):
        try:
            tlgs = TopLevelGeo.objects.all()
            for tlg in tlgs:
                count = {
                    'work_in_education': 0,
                    'work_in_industry': 0,
                    'work_in_political': 0,
                    'work_in_research': 0,
                }

                steamies = Steamies.objects.filter(top_level=tlg)
                for steamie in steamies:
                    work_in_field = 'work_in_{0}'.format(steamie.work_in)
                    count[work_in_field] += 1

                TopLevelGeo.objects\
                    .filter(pk=tlg.pk)\
                    .update(**count)

            
        except CommandError as detail:
            print 'Error resetting values data! ' +\
                '{0}'.format(detail)
