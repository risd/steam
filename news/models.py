from django.db import models

from django.utils.translation import ugettext as _


class Tweet(models.Model):
    class Meta:
        verbose_name = _('Tweet')
        verbose_name_plural = _('Tweets')

    def __unicode__(self):
        return self.url()

    twitter_id = models.CharField('Tweet ID', max_length=200)
    user = models.CharField('User', max_length=16)
    html = models.CharField('Tweet', max_length=50)
    timestamp = models.DateTimeField('timestamp')

    def url(self):
        # https://twitter.com/<user>/status/<id>
        return 'https://twitter.com/' +\
            '{0}/'.format(self.user) +\
            'status/' +\
            '{0}'.format(self.tweetid)


class TumblEvent(models.Model):
    class Meta:
        verbose_name = _('Tumblr Event')
        verbose_name_plural = _('Tumblr Events')

    def __unicode__(self):
        return unicode(self.tid)

    tid = models.BigIntegerField('Tumblr ID')
    html = models.TextField('Tumblr Post')
    url = models.URLField('Post URL')
    state = models.CharField('State', max_length=50)

    steam_html = models.TextField('STEAM Formatted Post')
    steam_url = models.URLField('STEAM Post URL')

    timestamp = models.DateTimeField('timestamp')


class TumblFeature(models.Model):
    class Meta:
        verbose_name = _('Tumblr Event')
        verbose_name_plural = _('Tumblr Events')

    def __unicode__(self):
        return unicode(self.tid)

    tid = models.BigIntegerField('Tumblr ID')
    html = models.TextField('Tumblr Post')
    url = models.URLField('Post URL')
    state = models.CharField('state', max_length=50)

    steam_html = models.TextField('STEAM Formatted Post')
    steam_url = models.URLField('STEAM Post URL')

    timestamp = models.DateTimeField('timestamp')


class News(models.Model):
    class Meta:
        verbose_name = _('News')
        verbose_name_plural = _('News\'')

    def __unicode__(self):
        pass

    tweet = models.OneToOneField(
        Tweet,
        on_delete=models.SET_NULL,
        related_name='tweet',
        blank=True,
        null=True)

    tumbl_event = models.OneToOneField(
        TumblEvent,
        on_delete=models.SET_NULL,
        related_name='tumbl_event',
        blank=True,
        null=True)

    tumbl_feature = models.OneToOneField(
        TumblFeature,
        on_delete=models.SET_NULL,
        related_name='tumbl_feature',
        blank=True,
        null=True)
