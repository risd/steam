import logging
import json

from django.conf import settings
from django.http import HttpResponse

import mailchimp


logger = logging.getLogger(__name__)


def join_us(request):
    # process request data
    if request.method == 'POST':
        logger.info('post data')
        logger.info(request.POST)

    # get mailchimp instance
    m = mailchimp.Mailchimp(apikey=settings.MAILCHIMP_APIKEY)

    # test list
    # https://us3.admin.mailchimp.com/lists/members/?id=221165
    mres = m.lists.batch_subscribe(
        id=221165,
        batch=[])

    response_data = {}
    response_data['result'] = 'Successfully added'
    response_data['message'] = 'You were successfully added!'
    return HttpResponse(json.dumps(response_data))
