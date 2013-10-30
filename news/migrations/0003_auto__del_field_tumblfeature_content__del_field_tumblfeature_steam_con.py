# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting field 'TumblFeature.content'
        db.delete_column(u'news_tumblfeature', 'content')

        # Deleting field 'TumblFeature.steam_content'
        db.delete_column(u'news_tumblfeature', 'steam_content')

        # Adding field 'TumblFeature.html'
        db.add_column(u'news_tumblfeature', 'html',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)

        # Adding field 'TumblFeature.steam_html'
        db.add_column(u'news_tumblfeature', 'steam_html',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)

        # Deleting field 'Tweet.content'
        db.delete_column(u'news_tweet', 'content')

        # Adding field 'Tweet.html'
        db.add_column(u'news_tweet', 'html',
                      self.gf('django.db.models.fields.CharField')(default=datetime.datetime(2013, 10, 29, 0, 0), max_length=50),
                      keep_default=False)

        # Deleting field 'TumblEvent.content'
        db.delete_column(u'news_tumblevent', 'content')

        # Deleting field 'TumblEvent.steam_content'
        db.delete_column(u'news_tumblevent', 'steam_content')

        # Adding field 'TumblEvent.html'
        db.add_column(u'news_tumblevent', 'html',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)

        # Adding field 'TumblEvent.steam_html'
        db.add_column(u'news_tumblevent', 'steam_html',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)


    def backwards(self, orm):
        # Adding field 'TumblFeature.content'
        db.add_column(u'news_tumblfeature', 'content',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)

        # Adding field 'TumblFeature.steam_content'
        db.add_column(u'news_tumblfeature', 'steam_content',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)

        # Deleting field 'TumblFeature.html'
        db.delete_column(u'news_tumblfeature', 'html')

        # Deleting field 'TumblFeature.steam_html'
        db.delete_column(u'news_tumblfeature', 'steam_html')

        # Adding field 'Tweet.content'
        db.add_column(u'news_tweet', 'content',
                      self.gf('django.db.models.fields.CharField')(default=datetime.datetime(2013, 10, 29, 0, 0), max_length=50),
                      keep_default=False)

        # Deleting field 'Tweet.html'
        db.delete_column(u'news_tweet', 'html')

        # Adding field 'TumblEvent.content'
        db.add_column(u'news_tumblevent', 'content',
                      self.gf('django.db.models.fields.TextField')(default=0),
                      keep_default=False)

        # Adding field 'TumblEvent.steam_content'
        db.add_column(u'news_tumblevent', 'steam_content',
                      self.gf('django.db.models.fields.TextField')(default=datetime.datetime(2013, 10, 29, 0, 0)),
                      keep_default=False)

        # Deleting field 'TumblEvent.html'
        db.delete_column(u'news_tumblevent', 'html')

        # Deleting field 'TumblEvent.steam_html'
        db.delete_column(u'news_tumblevent', 'steam_html')


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
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tweet': {
            'Meta': {'object_name': 'Tweet'},
            'html': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'twitter_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        }
    }

    complete_apps = ['news']