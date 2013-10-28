from django.core.management.base import BaseCommand, CommandError

from ...models import Individual, Institution, Initiative


class Command(BaseCommand):
    args = 'No arguments.'
    help = 'Populate some test data.'
    data = {
        'Institution': [{
            'name': 'RISD',
            'url': 'risd.edu',
            'representative_first_name': 'Micah',
            'representative_last_name': 'Johnson',
            'representative_email': 'micah@johnson.edu',
            'zip_code': '02903'
        }],
        'Individual': [{
            'description': 'I am into steam because',
            'email': 'name@domain.me',
            'email_subscription': True,
            'engaged_as': 'Practitioner',
            'first_name': 'dnice',
            'last_name': 'a-a-ron',
            'zip_code': '98107'
        }]
    }

    def handle(self, *args, **kwargs):
        for model in self.data:
            for datum in self.data[model]:
                try:
                    if model == 'Initiative':
                        print 'Initiative'
                        new_entry = Initiative()

                    elif model == 'Individual':
                        print 'Individual'
                        new_entry = Individual()
                        new_entry.description = \
                            datum['description']
                        new_entry.email = datum['email']
                        new_entry.email_subscription = \
                            datum['email_subscription']
                        new_entry.engaged_as = \
                            datum['engaged_as']
                        new_entry.first_name = \
                            datum['first_name']
                        new_entry.last_name = datum['last_name']
                        new_entry.zip_code = datum['zip_code']

                    elif model == 'Institution':
                        print 'Institution'
                        new_entry = Institution()
                        new_entry.name = datum['name']
                        new_entry.url = datum['url']
                        new_entry.representative_first_name = \
                            datum['representative_first_name']
                        new_entry.representative_last_name = \
                            datum['representative_last_name']
                        new_entry.representative_email = \
                            datum['representative_email']
                        new_entry.zip_code = datum['zip_code']

                    new_entry.save()

                except CommandError as detail:
                    print 'Error creating data! ' +\
                        '{0}'.format(detail)
