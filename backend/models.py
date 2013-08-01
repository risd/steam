from django.db import models
from django.utils.translation import ugettext as _


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


class Steamies(models.Model):

    # required
    zip_code = models.CharField(
        "Zip code",
        max_length=15,
        blank=False,
        null=False)

    # populated based on zip
    latitude = models.FloatField(
        blank=True,
        null=True)

    longitude = models.FloatField(
        blank=True,
        null=True)

    geohash = models.CharField(
        max_length=50,
        blank=True,
        null=True)

    # optional
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
        pass


class Institution(Steamies):

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
        self.name


class Individual(Steamies):

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
        pass
