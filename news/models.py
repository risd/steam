from django.db import models
from django.dispatch import receiver

from django.utils.translation import ugettext as _


class HashTweet(models.Model):
    """
    Any #stemtosteam tweets
    """

    class Meta:
        verbose_name = _('Hash Tweet')
        verbose_name_plural = _('Hash Tweets')

    def __unicode__(self):
        return self.tid

    tid = models.CharField('Tweet ID', max_length=200)
    user = models.CharField('User', max_length=16)
    screen_name = models.CharField('Screen name', max_length=50)
    html = models.TextField('STEAM formatted Tweet')
    timestamp = models.DateTimeField('timestamp')
    epoch_timestamp = models.IntegerField('Epoch timestamp')
    url = models.URLField('Tweet URL')
    text = models.TextField('Tweet content')


class Tweet(models.Model):
    """
    Tweets/Retweets/Favs from @STEMtoSTEAM
    """

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
    epoch_timestamp = models.IntegerField('Epoch timestamp')
    url = models.URLField('Tweet URL')
    text = models.TextField('Tweet content')


class Tumbl(models.Model):
    """
    Tumblr posts, either features or events
    """
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
    epoch_timestamp = models.IntegerField('Epoch timestamp')
    ticker_timestamp = models.CharField(
        'News Ticker Timestamp',
        max_length=50)
    announcement = models.BooleanField('Announcement')


class NewsManager(models.Manager):
    def timestamp_order(self, *args, **kwargs):
        qs = self.get_query_set().filter(*args, **kwargs)
        f = lambda x: \
            x.tumbl.timestamp \
            if x.tumbl is not None \
            else x.tweet.timestamp

        return sorted(qs, key=f, reverse=True)


class News(models.Model):
    class Meta:
        verbose_name = _('News')
        verbose_name_plural = _('News\'')

    def __unicode__(self):
        if self.tweet is not None:
            return unicode(self.tweet)
        elif self.tumbl is not None:
            return unicode(self.tumbl)

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

    epoch_timestamp = models.IntegerField('Epoch timestamp')

    objects = NewsManager()


@receiver(models.signals.pre_delete, sender=Tweet)
def delete_news_tweet(sender, instance, **kwargs):
    News.objects.get(tweet=instance).delete()


@receiver(models.signals.pre_delete, sender=Tumbl)
def delete_news_tumbl(sender, instance, **kwargs):
    News.objects.get(tumbl=instance).delete()
