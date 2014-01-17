from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import ugettext as _

from .signals.geo import Geo


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


    class Meta:
        verbose_name = _('TopLevelGeo')
        verbose_name_plural = _('TopLevelGeos')

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

    # required
    name = models.CharField("Name", max_length=100)

    url = models.URLField(
        blank=False,
        null=True)

    representative_first_name = models.CharField(
        "First name",
        max_length=100,
        blank=False,
        null=False)

    representative_last_name = models.CharField(
        "Last name",
        max_length=100,
        blank=False,
        null=False)

    representative_email = models.EmailField(
        "First name",
        max_length=100,
        blank=False,
        null=False)

    class Meta:
        verbose_name = _('Institution')
        verbose_name_plural = _('Institutions')

    def __unicode__(self):
        return self.name


class Individual(models.Model):

    # required
    first_name = models.CharField(
        "First name",
        max_length=100,
        blank=False,
        null=False)

    last_name = models.CharField(
        "Last name",
        max_length=100,
        blank=False,
        null=False)

    email = models.EmailField(
        "Email",
        max_length=100,
        blank=False,
        null=False)

    # optional
    url = models.URLField(
        blank=True,
        null=True)

    institution = models.ForeignKey(
        Institution,
        blank=True,
        null=True)

    title = models.CharField("Title", max_length=100)

    email_subscription = models.BooleanField(default=False)

    class Meta:
        verbose_name = _('Individual')
        verbose_name_plural = _('Individuals')

    def __unicode__(self):
        return "{0} {1}".format(self.first_name, self.last_name)


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
        null=False)

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
        "Describe STEAMaffiliation",
        blank=True,
        null=True)

    initiative = models.ForeignKey(
        Initiative,
        blank=True,
        null=True)

    class Meta:
        verbose_name = _('Steamies')
        verbose_name_plural = _("Steamies'")

    def __unicode__(self):
        return unicode(self.user) or unicode(self.zip_code)


def add_geo(sender, instance, created, *args, **kwargs):
    if not isinstance(instance.top_level_input, type(None)):
        # could make this a bit more efficient if, on save
        # you passed the update_fields attribute. then
        # you could simply see if update_fields includes
        # zip_code, and then, and only then, would the
        # top_level be re-assessed.

        # instance.save(update_fields=['name'])

        g = Geo()
        geo = g.geo(instance.top_level_input)

        if 'error' in geo:
            instance.top_level_input = None
        else:
            try:
                # will raise ObjectDoesNotExist
                # if it does not find an object
                top_level_geo = TopLevelGeo.get(**geo)
                instance.top_level = top_level_geo

            except ObjectDoesNotExist:
                instance.top_level_input = None

        print 'resaved with geo'
        print instance.top_level

        instance.save()

models.signals.post_save.connect(add_geo, sender=Steamies)
