# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'Tumbl'
        db.delete_table(u'news_tumbl')

        # Adding model 'TumblFeature'
        db.create_table(u'news_tumblfeature', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('tid', self.gf('django.db.models.fields.BigIntegerField')()),
            ('steam_content', self.gf('django.db.models.fields.TextField')()),
            ('steam_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'news', ['TumblFeature'])

        # Adding model 'TumblEvent'
        db.create_table(u'news_tumblevent', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('content', self.gf('django.db.models.fields.TextField')()),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('tid', self.gf('django.db.models.fields.BigIntegerField')()),
            ('steam_content', self.gf('django.db.models.fields.TextField')()),
            ('steam_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'news', ['TumblEvent'])

        # Deleting field 'News.tumbl'
        db.delete_column(u'news_news', 'tumbl_id')

        # Adding field 'News.tumbl_event'
        db.add_column(u'news_news', 'tumbl_event',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl_event', null=True, on_delete=models.SET_NULL, to=orm['news.TumblEvent'], blank=True, unique=True),
                      keep_default=False)

        # Adding field 'News.tumbl_feature'
        db.add_column(u'news_news', 'tumbl_feature',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl_feature', null=True, on_delete=models.SET_NULL, to=orm['news.TumblFeature'], blank=True, unique=True),
                      keep_default=False)

        # Deleting field 'Tweet.created_at'
        db.delete_column(u'news_tweet', 'created_at')

        # Adding field 'Tweet.timestamp'
        db.add_column(u'news_tweet', 'timestamp',
                      self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime(2013, 10, 28, 0, 0)),
                      keep_default=False)


    def backwards(self, orm):
        # Adding model 'Tumbl'
        db.create_table(u'news_tumbl', (
            ('content', self.gf('django.db.models.fields.TextField')()),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
        ))
        db.send_create_signal(u'news', ['Tumbl'])

        # Deleting model 'TumblFeature'
        db.delete_table(u'news_tumblfeature')

        # Deleting model 'TumblEvent'
        db.delete_table(u'news_tumblevent')

        # Adding field 'News.tumbl'
        db.add_column(u'news_news', 'tumbl',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl', null=True, on_delete=models.SET_NULL, to=orm['news.Tumbl'], blank=True, unique=True),
                      keep_default=False)

        # Deleting field 'News.tumbl_event'
        db.delete_column(u'news_news', 'tumbl_event_id')

        # Deleting field 'News.tumbl_feature'
        db.delete_column(u'news_news', 'tumbl_feature_id')

        # Adding field 'Tweet.created_at'
        db.add_column(u'news_tweet', 'created_at',
                      self.gf('django.db.models.fields.DateTimeField')(default=datetime.datetime(2013, 10, 28, 0, 0)),
                      keep_default=False)

        # Deleting field 'Tweet.timestamp'
        db.delete_column(u'news_tweet', 'timestamp')


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
            'content': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'steam_content': ('django.db.models.fields.TextField', [], {}),
            'steam_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tid': ('django.db.models.fields.BigIntegerField', [], {}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tumblfeature': {
            'Meta': {'object_name': 'TumblFeature'},
            'content': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'steam_content': ('django.db.models.fields.TextField', [], {}),
            'steam_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tid': ('django.db.models.fields.BigIntegerField', [], {}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tweet': {
            'Meta': {'object_name': 'Tweet'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'twitter_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        }
    }

    complete_apps = ['news']