# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'Tweet.twitter_id'
        db.delete_column(u'news_tweet', 'twitter_id')

        # Adding field 'Tweet.tid'
        db.add_column(u'news_tweet', 'tid',
                      self.gf('django.db.models.fields.CharField')(default=datetime.datetime(2013, 10, 30, 0, 0), max_length=200),
                      keep_default=False)

        # Adding field 'Tweet.screen_name'
        db.add_column(u'news_tweet', 'screen_name',
                      self.gf('django.db.models.fields.CharField')(default=datetime.datetime(2013, 10, 30, 0, 0), max_length=50),
                      keep_default=False)

        # Adding field 'Tweet.url'
        db.add_column(u'news_tweet', 'url',
                      self.gf('django.db.models.fields.URLField')(default=datetime.datetime(2013, 10, 30, 0, 0), max_length=200),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'Tweet.twitter_id'
        db.add_column(u'news_tweet', 'twitter_id',
                      self.gf('django.db.models.fields.CharField')(default=datetime.datetime(2013, 10, 30, 0, 0), max_length=200),
                      keep_default=False)

        # Deleting field 'Tweet.tid'
        db.delete_column(u'news_tweet', 'tid')

        # Deleting field 'Tweet.screen_name'
        db.delete_column(u'news_tweet', 'screen_name')

        # Deleting field 'Tweet.url'
        db.delete_column(u'news_tweet', 'url')


    models = {
        u'news.news': {
            'Meta': {'object_name': 'News'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tumbl_event': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tumbl_event'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.TumblEvent']", 'blank': 'True', 'unique': 'True'}),
            'tumbl_feature': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tumbl_feature'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.TumblFeature']", 'blank': 'True', 'unique': 'True'}),
            'tweet': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tweet'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tweet']", 'blank': 'True', 'unique': 'True'})
        },
        u'news.tumblevent': {
            'Meta': {'object_name': 'TumblEvent'},
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'steam_html': ('django.db.models.fields.TextField', [], {}),
            'steam_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tid': ('django.db.models.fields.BigIntegerField', [], {}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tumblfeature': {
            'Meta': {'object_name': 'TumblFeature'},
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'steam_html': ('django.db.models.fields.TextField', [], {}),
            'steam_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tid': ('django.db.models.fields.BigIntegerField', [], {}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tweet': {
            'Meta': {'object_name': 'Tweet'},
            'html': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'screen_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'tid': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        }
    }

    complete_apps = ['news']