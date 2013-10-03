from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import ugettext as _

from .signals.geo import Geo


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

    zip_code = models.CharField(
        "Zip code",
        max_length=15,
        blank=True,
        null=True)

    avatar_url = models.URLField(
        "Avatar url",
        max_length=200,
        blank=True,
        null=True)

    # captures the top level region that data
    # will be associated with. Either a US State,
    # or a country
    top_level = models.CharField(
        'State_District or Country Abbreviation',
        max_length=6,
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
    if not isinstance(instance.zip_code, type(None)):
        # could make this a bit more efficient if, on save
        # you passed the update_fields attribute. then
        # you could simply see if update_fields includes
        # zip_code, and then, and only then, would the
        # top_level be re-assessed.

        # instance.save(update_fields=['name'])

        # must have a zip_code

        g = Geo()
        geo = g.geo(instance.zip_code)
        ## these are now removed
        # instance.longitude = float(geo['lon'])
        # instance.latitude = float(geo['lat'])
        # instance.us_bool = geo['us_bool']
        instance.top_level = geo['top_level']

        print 'resaved with geo'
        print instance.top_level

        instance.save()

models.signals.post_save.connect(add_geo, sender=Steamies)
