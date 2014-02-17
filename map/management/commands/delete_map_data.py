"""
This should take command line options
for deleting different sets of data.

For now, commenting out the bits that
are not relavent, and mentioning printing
that to the console, as a reminder for 
future use.
"""

from django.core.management.base import BaseCommand, CommandError

from django.contrib.auth.models import User

from social.apps.django_app.default.models import UserSocialAuth,\
                                                  Association,\
                                                  Nonce,\
                                                  Code
from ...models import Individual,\
                      Institution,\
                      Initiative,\
                      Steamies,\
                      TopLevelGeo


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Delete all Individual, Institution and Initiative data.'

    def handle(self, *args, **kwargs):
        try:
            print 'Deleting User'
            User.objects.filter(id__gte=2).delete()

            # print 'commented out: Deleting Steamie models'
            print 'Deleting Steamie models'
            Steamies.objects.all().delete()

            # print 'commented out: Deleting Initiative models'
            print 'Deleting Initiative models'
            Initiative.objects.all().delete()

            # print 'commented out: Deleting Institution models'
            print 'Deleting Institution models'
            Institution.objects.all().delete()

            # print 'commented out: Deleting Individual models'
            print 'Deleting Individual models'
            Individual.objects.all().delete()

            print 'Deleting Social Auth Business'
            UserSocialAuth.objects.all().delete()
            Association.objects.all().delete()
            Nonce.objects.all().delete()
            Code.objects.all().delete()

            # toplevel geo counts are now updated on
            # steamie delete as well, so the primary
            # reason for this existing is not relevant
            print "commented out: Resetting TopLevelGeo Counts"
            # print "Resetting TopLevelGeo Counts"
            # tlgs = TopLevelGeo.objects.all()
            # for tlg in tlgs:
            #     tlg.work_in_education = 0
            #     tlg.work_in_research = 0
            #     tlg.work_in_industry = 0
            #     tlg.work_in_political = 0
            #     tlg.save()

        except CommandError as detail:
            print 'Error deleting data! ' +\
                '{0}'.format(detail)
