# Populates random data.

import random
import time

from django.core.management.base import BaseCommand, CommandError
from faker import Faker

from ...models import Individual, Institution, Initiative
from ...signals.zipcodes import Zipcodes


class RandomData():
    """
    Create random data to test with.
    """

    def __init__(self):
        self.individuals = self._prepIndividual()

    def _prepIndividual(self):
        individuals = []

        max_individuals = 10
        number_of_individuals = int(random.random() * max_individuals)

        f = Faker()
        z = Zipcodes()
        engaged_as_options = ['Practioner', 'Advocate', 'Other']
        for counter in range(0, number_of_individuals):
            individual = {}
            individual['description'] = f.lorem()[:200]
            individual['email'] = f.email()

            individual['email_subscription'] = \
                True if random.random() > 0.5 else False

            individual['engaged_as'] = \
                random.choice(engaged_as_options)

            individual['first_name'], individual['last_name'] = \
                f.name().split(' ')

            individual['zip_code'] = random.choice(z.zip_codes.keys())

            individuals.append(individual)

        return individuals


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Populate database with random data.'

    def handle(self, *args, **kwargs):
        random_data = RandomData()

        count = 0
        for datum in random_data.individuals:

            try:
                new_entry = Individual()

                print 'Individual'
                new_entry = Individual()
                new_entry.description = datum['description']
                new_entry.email = datum['email']

                new_entry.email_subscription = \
                    datum['email_subscription']

                new_entry.engaged_as = \
                    datum['engaged_as']

                new_entry.first_name = \
                    datum['first_name']

                new_entry.last_name = datum['last_name']

                # no zipcode, so drop a blank thing
                # in there, so the post_save
                # signal doesn't die on you.
                new_entry.zip_code = datum['zip_code']

                new_entry.save()
                print "\n\nnew entry"
                print new_entry
                print "\n\n"

            except CommandError as detail:
                print 'Error creating data! ' +\
                    '{0}'.format(detail)

            time.sleep(0.3)
            count += 1
            # if count > 5:
            #     # test only a few
            #     break
