from django.db import models

from django.utils.translation import ugettext as _


class Tweet(models.Model):
    class Meta:
        verbose_name = _('Tweet')
        verbose_name_plural = _('Tweets')

    def __unicode__(self):
        return self.tid

    tid = models.CharField('Tweet ID', max_length=200)
    user = models.CharField('User', max_length=16)
    screen_name = models.CharField('Screen name', max_length=50)
    html = models.TextField('STEAM formatted Tweet')
    timestamp = models.DateTimeField('timestamp')
    url = models.URLField('Tweet URL')
    text = models.TextField('Tweet content')


class Tumbl(models.Model):
    class Meta:
        verbose_name = _('Tumblr Post')
        verbose_name_plural = _('Tumblr Posts')

    def __unicode__(self):
        return self.steam_url

    tid = models.BigIntegerField('Tumblr ID')
    tagged_type = models.CharField('Post Type', max_length=50)
    html = models.TextField('Tumblr Post')
    url = models.URLField('Post URL')
    title = models.CharField('title', max_length=50, default="")
    state = models.CharField('State', max_length=50)

    steam_html = models.TextField('STEAM Formatted Post')
    steam_url = models.URLField('STEAM Post URL')

    timestamp = models.DateTimeField('timestamp')
    ticker_timestamp = models.CharField(
        'News Ticker Timestamp',
        max_length=50)


class News(models.Model):
    class Meta:
        verbose_name = _('News')
        verbose_name_plural = _('News\'')

    def __unicode__(self):
        if self.tweet:
            return self.tweet
        elif self.tumbl:
            return self.tumbl

    tweet = models.OneToOneField(
        Tweet,
        on_delete=models.SET_NULL,
        related_name='tweet',
        blank=True,
        null=True)

    tumbl = models.OneToOneField(
        Tumbl,
        on_delete=models.SET_NULL,
        related_name='tumbl',
        blank=True,
        null=True)
