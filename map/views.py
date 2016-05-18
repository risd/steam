import logging
import json
import unicodecsv as csv
from datetime import datetime

from django.contrib.auth import logout
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.forms.models import model_to_dict

from .models import Steamies, TopLevelGeo

logging.basicConfig()
logger = logging.getLogger(__name__)


@ensure_csrf_cookie
def map(request):
    """
    Directs request to the map application.
    """
    return render(request, 'map/map.html', {})


def logged_in(request):
    """
    Redirect to map. Subsequent call will determine
    state of the application.
    """
    return redirect('/')


def login_error(request):
    """
    Redirect to map. Subsequent call will determine
    state of the application.
    """
    return redirect('/')

def log_out(request):
    """
    Log the user out. Returns status of log out.
    """
    status = {
        'logged_out': True
    }
    try:
        logout(request)
    except Exception as e:
        err = 'Error logging out. {0}'.format(e)
        logger.info(err)
    finally:
        return HttpResponse(content=json.dumps(status),
                            mimetype='application/json')

def spreadsheet_geo_fields(geo_model):
    try:
        geo = model_to_dict(geo_model)
        geo.pop('maxx', None)
        geo.pop('maxy', None)
        geo.pop('minx', None)
        geo.pop('miny', None)
        geo.pop('us_bool', None)
        geo.pop('lat', None)
        geo.pop('lon', None)
        geo.pop('work_in_education', None)
        geo.pop('work_in_industry', None)
        geo.pop('work_in_research', None)
        geo.pop('work_in_political', None)
        geo.pop('us_state_abbr', None)
        geo.pop('id', None)
    except AttributeError:
        geo = {}

    return geo

def spreadsheet_steamie_fields(steamie):
    s = model_to_dict(steamie)
    s.pop('id', None)
    s.pop('user', None)
    s.pop('top_level_input', None)
    s.pop('avatar_url', None)
    s.pop('individual', None)
    s.pop('institution', None)
    s.pop('top_level', None)

    return s

def spreadsheet_individual(request):
    """
    Return a CSV of the STEAMies that have signed up
    """
    response = HttpResponse(content_type="text/csv")
    response['Content-Disposition'] = \
        'attachment; filename="steam-map-individuals-%s.csv"' % \
        (datetime.strftime(
            datetime.now(), '%Y-%m-%d--%H-%M-%S'))

    fieldnames = [
        'us_state',
        'us_district',
        'us_district_ordinal',
        'country',
        'first_name',
        'last_name',
        'email',
        'url',
        'institution',
        'title',
        'email_subscription',
        'engaged_as',
        'work_in',
        'tags',
        'initiative',
        'description',
    ]

    writer = csv.DictWriter(response, fieldnames=fieldnames)
    writer.writeheader()

    query = Steamies.objects\
        .select_related('top_level')\
        .select_related('individual')\
        .filter(individual__isnull=False)\
        .distinct()

    for steamie in query:
        # dictionaries to merge
        geo = spreadsheet_geo_fields(steamie.top_level)
        individual = model_to_dict(steamie.individual)
        individual.pop('id', None)
        s = spreadsheet_steamie_fields(steamie)

        row = {}

        row.update(geo)
        row.update(individual)
        row.update(s)

        writer.writerow(row)

    return response

def spreadsheet_institution(request):
    """
    Return a CSV of the institution STEAMies
    that have signed up
    """
    response = HttpResponse(content_type="text/csv")
    response['Content-Disposition'] = \
        'attachment; filename="steam-map-institutions-%s.csv"' %\
        (datetime.strftime(
            datetime.now(), '%Y-%m-%d--%H-%M-%S'))

    fieldnames = [
        'us_state',
        'us_district',
        'us_district_ordinal',
        'country',
        'name',
        'url',
        'representative_first_name',
        'representative_last_name',
        'representative_email',
        'engaged_as',
        'work_in',
        'tags',
        'initiative',
        'description',
    ]

    writer = csv.DictWriter(response, fieldnames=fieldnames)
    writer.writeheader()

    query = Steamies.objects\
        .select_related('top_level')\
        .select_related('institution')\
        .filter(institution__isnull=False)\
        .distinct()

    for steamie in query:
        # dictionaries to merge
        geo = spreadsheet_geo_fields(steamie.top_level)
        institution = model_to_dict(steamie.institution)
        institution.pop('id', None)
        s = spreadsheet_steamie_fields(steamie)

        row = {}

        row.update(geo)
        row.update(institution)
        row.update(s)

        writer.writerow(row)

    return response

