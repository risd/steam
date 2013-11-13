import logging
import json

from django.conf import settings
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

import mailchimp


logger = logging.getLogger(__name__)


@csrf_exempt
def join_us(request):
    logger.info(request.method)

    # process request from client, set expectations
    if request.method == 'OPTIONS':
        response = HttpResponse("")
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'X-Requested-With'
        response['Access-Control-Max-Age'] = '1800'

    # process the payload
    response_data = {}
    if request.method == 'POST':
        payload = json.loads(request.body)

        # get mailchimp instance
        m = mailchimp.Mailchimp(apikey=settings.MAILCHIMP_APIKEY)

        subscribers = []

        subscribers.append({
            'email': {
                'email': payload['email'],
            },
            'email_type': 'html',
            'merge_vars': {
                'FNAME': payload['first_name'],
                'LNAME': payload['last_name'],
                'EMAIL': payload['email'],
                'WEBST': payload['website'],
            }
        })

        # test list
        # found under lists > list > settings > list name & defaults
        mres = m.lists.batch_subscribe(
            id=settings.MAILCHIMP_LIST_ID,
            batch=subscribers)

        logger.info("mailchimp response")
        logger.info(mres)

        if mres[u'error_count']:
            logger.info('mailchimp error')
            response_data['result'] = 'Error'
            response_data['message'] = mres[u'errors'][0][u'error']
        else:
            response_data['result'] = 'Success'
            response_data['message'] = 'You were successfully added!'

        # end of request.method == POST statmenet
    else:
        # process any non POST or OPTIONS requests
        response_data['result'] = 'Failed.'
        response_data['message'] = 'Failed.'

    logger.info('response_data')
    logger.info(response_data)
    return HttpResponse(json.dumps(response_data))
