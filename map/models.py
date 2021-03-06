import logging

from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.db import models
from django.db.models import F
from django.utils.translation import ugettext as _

from .signals.geo import Geo


logging.basicConfig()
logger = logging.getLogger(__name__)


class TopLevelGeo(models.Model):
    """
    Represents all US districts or countries in the world.
    GeoJSON for map markers is derived from here.

    To add all TopLevelGeo values:
    foreman run python manage.py populate_toplevelgeo
    """
    us_bool = models.BooleanField(blank=False, null=False)
    lat = models.DecimalField(
        'Latitude',
        max_digits=7,
        decimal_places=5,
        blank=False,
        null=False)
    lon = models.DecimalField(
        'Longitude',
        max_digits=8,
        decimal_places=5,
        blank=False,
        null=False)

    # if us_bool == True, all of these are filled:
    us_state = models.CharField(
        'US State',
        max_length=50,
        blank=True,
        null=True)
    us_state_abbr = models.CharField(
        'US State Abbreviation',
        blank=True,
        null=True,
        max_length=4)
    us_district = models.IntegerField(
        'US District',
        blank=True,
        null=True)
    us_district_ordinal = models.CharField(
        'US District Ordinal',
        blank=True,
        null=True,
        max_length=4)

    # otherwise, just the country is filled:
    country = models.CharField(
        'Country',
        max_length=75,
        blank=True,
        null=True)

    work_in_education = models.IntegerField(
        'Work in Education count',
        default=0,
        blank=False,
        null=False)

    work_in_research = models.IntegerField(
        'Work in Research count',
        default=0,
        blank=False,
        null=False)

    work_in_political = models.IntegerField(
        'Work in Political count',
        default=0,
        blank=False,
        null=False)

    work_in_industry = models.IntegerField(
        'Work in Industry count',
        default=0,
        blank=False,
        null=False)

    minx = models.DecimalField(
        'Bounding Box Minimum Longitude',
        max_digits=8,
        decimal_places=5,
        blank=False,
        null=False,
        default=-999)

    miny = models.DecimalField(
        'Bounding Box Minimum Latitude',
        max_digits=8,
        decimal_places=5,
        blank=False,
        null=False,
        default=-999)

    maxx = models.DecimalField(
        'Bounding Box Maximum Longitude',
        max_digits=8,
        decimal_places=5,
        blank=False,
        null=False,
        default=-999)

    maxy = models.DecimalField(
        'Bounding Box Maximum Latitude',
        max_digits=8,
        decimal_places=5,
        blank=False,
        null=False,
        default=-999)


    class Meta:
        verbose_name = _('TopLevelGeo')
        verbose_name_plural = _('TopLevelGeos')

    def as_feature(self, **kwargs):
        return {
            'geometry': self.as_geometry(),
            'id': self.pk,
            'properties': {
                'tlg_id': self.pk,
                'us_bool': self.us_bool,
                'country': self.country,
                'us_state': self.us_state,
                'us_district': self.us_district,
                'us_district_ordinal': self.us_district_ordinal,
                'name': unicode(self),
                'education': self.work_in_education,
                'research': self.work_in_research,
                'political': self.work_in_political,
                'industry': self.work_in_industry,
                'minx': float(self.minx),
                'miny': float(self.miny),
                'maxx': float(self.maxx),
                'maxy': float(self.maxy),
            },
            'type': 'Feature',
        }

    def as_geometry(self):
        return self.__geo_interface__()

    def bbox(self):
        return {
            'minx': float(self.minx),
            'miny': float(self.miny),
            'maxx': float(self.maxx),
            'maxy': float(self.maxy),
        }

    def work_in_total(self):
        return self.work_in_education +\
               self.work_in_research +\
               self.work_in_political +\
               self.work_in_industry

    def work_in_dict(self):
        return {
            'work_in_education': self.work_in_education,
            'work_in_research': self.work_in_research,
            'work_in_political': self.work_in_political,
            'work_in_industry': self.work_in_industry,
        }

    def change_work_in_count(self, amount=0, field=None):
        logger.info('Updating work in count')
        logger.info('work_in   = {0}'.format(field))
        logger.info('top_lev   = {0}'.format(self))
        logger.info('amount    = {0}'.format(amount))

        if field == 'education':
            TopLevelGeo.objects\
                .filter(pk=self.pk)\
                .update(
                    work_in_education=\
                        F('work_in_education') + amount)
        elif field == 'research':
            TopLevelGeo.objects\
                .filter(pk=self.pk)\
                .update(
                    work_in_research=\
                        F('work_in_research') + amount)
        elif field == 'industry':
            TopLevelGeo.objects\
                .filter(pk=self.pk)\
                .update(
                    work_in_industry=\
                        F('work_in_industry') + amount)
        elif field == 'political':
            TopLevelGeo.objects\
                .filter(pk=self.pk)\
                .update(
                    work_in_political=\
                        F('work_in_political') + amount)
        else:
            logger.info('No field to update.')

    def __geo_interface__(self):
        return {
            'type': 'Point',
            'coordinates': (float(self.lon), float(self.lat)),
        }

    def __unicode__(self):
        if (self.us_bool):
            return u'{0} {1}'.format(self.us_state,
                                    self.us_district_ordinal) +\
                   u' District'
        else:
            return u'{0}'.format(self.country)


class Initiative(models.Model):
    # optional
    title = models.CharField(
        'Title',
        max_length=50,
        blank=True,
        null=True)

    url = models.URLField(
        blank=True,
        null=True)

    class Meta:
        verbose_name = _('Initiative')
        verbose_name_plural = _('Initiatives')

    def __unicode__(self):
        pass


class Institution(models.Model):

    # all optional
    name = models.CharField(
        "Name",
        max_length=100,
        blank=True,
        null=True)

    url = models.URLField(
        blank=True,
        null=True)

    representative_first_name = models.CharField(
        "First name",
        max_length=100,
        blank=True,
        null=True)

    representative_last_name = models.CharField(
        "Last name",
        max_length=100,
        blank=True,
        null=True)

    representative_email = models.EmailField(
        "First name",
        max_length=100,
        blank=True,
        null=True)

    class Meta:
        verbose_name = _('Institution')
        verbose_name_plural = _('Institutions')

    def __unicode__(self):
        if self.name:
            return self.name
        else:
            return u'Institution'


class Individual(models.Model):

    # all optional
    first_name = models.CharField(
        "First name",
        max_length=100,
        blank=True,
        null=True)

    last_name = models.CharField(
        "Last name",
        max_length=100,
        blank=True,
        null=True)

    email = models.EmailField(
        "Email",
        max_length=100,
        blank=True,
        null=True)

    url = models.URLField(
        blank=True,
        null=True)

    institution = models.ForeignKey(
        Institution,
        blank=True,
        null=True)

    title = models.CharField(
        "Title",
        max_length=100,
        blank=True,
        null=True)

    email_subscription = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('Individual')
        verbose_name_plural = _('Individuals')

    def __unicode__(self):
        if self.first_name and self.last_name:
            return u"{0} {1}".format(self.first_name, self.last_name)
        else:
            return 'Individual'


class Steamies(models.Model):

    # required
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        related_name="steamies",
        blank=True,
        null=True)

    # the text that is inputed from the User to
    # map to a TopLevelGeo model instance
    # either a country selected from a list,
    # or a zipcode in the US
    top_level_input = models.CharField(
        'Top Level Input',
        max_length=75,
        blank=True,
        null=True)

    avatar_url = models.URLField(
        "Avatar url",
        max_length=200,
        blank=True,
        null=True)

    # captures the top level region that data
    # will be associated with. Either a US district,
    # or a country
    top_level = models.ForeignKey(
        TopLevelGeo,
        related_name='top_level',
        blank=True,
        null=True)

    # optional
    individual = models.OneToOneField(
        Individual,
        on_delete=models.SET_NULL,
        related_name="individual",
        blank=True,
        null=True)

    institution = models.OneToOneField(
        Institution,
        on_delete=models.SET_NULL,
        related_name="institution",
        blank=True,
        null=True)

    engaged_as = models.CharField(
        max_length=30,
        blank=True,
        null=True)

    # education, research, industry, policy
    work_in = models.CharField(
        max_length=30,
        blank=True,
        null=True)

    tags = models.TextField(
        "Tags",
        blank=True,
        null=True)

    description = models.TextField(
        "Describe STEAM affiliation",
        blank=True,
        null=True)

    initiative = models.ForeignKey(
        Initiative,
        blank=True,
        null=True)

    class Meta:
        verbose_name = _('Steamies')
        verbose_name_plural = _("Steamies'")

    def change_work_in_count(self, amount=0):
        if (self.work_in and self.top_level):
            self.top_level\
                .change_work_in_count(
                    amount=amount,
                    field=self.work_in)

            logger.info('Updated work_in count')

    def set_geo(self):
        if self.top_level_input:
            g = Geo()
            geo = g.geo(self.top_level_input)

            if 'error' in geo:
                logger.info('Could not find zipcode for: '+\
                    '{0}'.format(self.top_level))
                self.top_level_input = None
            else:
                try:
                    # will raise ObjectDoesNotExist
                    # if it does not find an object
                    top_level_geo = TopLevelGeo.objects.get(**geo)
                    self.top_level = top_level_geo
                except ObjectDoesNotExist:
                    logger.error(
                        'Setting TopLevelGeo relationship to' +\
                        'Steamie\ntop_level_input: ' +\
                        '{0}'.format(self.top_level_input))

                    self.top_level_input = None

        logger.info('Set top_level_geo')

    def __unicode__(self):
        return unicode(self.user) or unicode(self.zip_code)


def update_steamie_related_delete(sender,instance, *args, **kwargs):
    if instance.institution is not None:
        instance.institution.delete()

    if instance.individual is not None:
        instance.individual.delete()

    if instance.top_level is not None:
        instance.change_work_in_count(amount=-1)


def update_steamie_related_save(sender, instance, *args, **kwargs):
    """
    TopLevelGeo and the work_in counts are
    based on user input, which can change. If 
    it does update the relationship and the
    count associated with it.
    Adds first and last name to individual
    object if they have just signed up as
    and individual. Add username as organization
    name if signed up as an organization.
    """

    if instance.pk:
        old = Steamies.objects.get(pk=instance.pk)
    else:
        # the first time a steamie gets saved,
        # it has NO information in it, except
        # for its attached user account. so
        # nothing needs to happen to it.

        # fake, or computer generated STEAMies
        # will not have a top_level_input, nor
        # will they have an old instace. everything
        # gets set in one go.
        if instance.tags == 'fake':
            instance.change_work_in_count(amount=1)

        return
    
    top_level_input_change = False

    if old.top_level_input != instance.top_level_input:

        instance.set_geo()
        if instance.top_level_input is None:
            # if an invalid value is passed,
            # then it didn't actually change
            instance.top_level_input = old.top_level_input
        else:
            top_level_input_change = True


    if (old.work_in != instance.work_in) or\
        top_level_input_change:

        logger.info('\nChanging old')
        old.change_work_in_count(amount=-1)
        logger.info('\nChanging new')
        instance.change_work_in_count(amount=1)

    if ((old.individual is None) and\
        (not (instance.individual is None)) and\
        (not (instance.user is None))):

        instance.individual.first_name = instance.user.first_name
        instance.individual.last_name = instance.user.last_name
        instance.individual.save()

    elif ((old.institution is None) and\
          (not (instance.institution is None)) and\
          (not (instance.user is None))):

        instance.institution.name = instance.user.username
        instance.institution.save()

models.signals.pre_save.connect(update_steamie_related_save,
                                sender=Steamies)
models.signals.pre_delete.connect(update_steamie_related_delete,
                                  sender=Steamies)
