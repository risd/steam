# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'TumblFeature'
        db.delete_table(u'news_tumblfeature')

        # Deleting model 'TumblEvent'
        db.delete_table(u'news_tumblevent')

        # Adding model 'Tumbl'
        db.create_table(u'news_tumbl', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tid', self.gf('django.db.models.fields.BigIntegerField')()),
            ('tagged_type', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('html', self.gf('django.db.models.fields.TextField')()),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('title', self.gf('django.db.models.fields.CharField')(default='', max_length=50)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('steam_html', self.gf('django.db.models.fields.TextField')()),
            ('steam_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'news', ['Tumbl'])

        # Deleting field 'News.tumbl_event'
        db.delete_column(u'news_news', 'tumbl_event_id')

        # Deleting field 'News.tumbl_feature'
        db.delete_column(u'news_news', 'tumbl_feature_id')

        # Adding field 'News.tumbl'
        db.add_column(u'news_news', 'tumbl',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl', null=True, on_delete=models.SET_NULL, to=orm['news.Tumbl'], blank=True, unique=True),
                      keep_default=False)


    def backwards(self, orm):
        # Adding model 'TumblFeature'
        db.create_table(u'news_tumblfeature', (
            ('steam_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('title', self.gf('django.db.models.fields.CharField')(default='', max_length=50)),
            ('tid', self.gf('django.db.models.fields.BigIntegerField')()),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')()),
            ('steam_html', self.gf('django.db.models.fields.TextField')()),
            ('html', self.gf('django.db.models.fields.TextField')()),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
        ))
        db.send_create_signal(u'news', ['TumblFeature'])

        # Adding model 'TumblEvent'
        db.create_table(u'news_tumblevent', (
            ('steam_url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('state', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('title', self.gf('django.db.models.fields.CharField')(default='', max_length=50)),
            ('tid', self.gf('django.db.models.fields.BigIntegerField')()),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')()),
            ('steam_html', self.gf('django.db.models.fields.TextField')()),
            ('html', self.gf('django.db.models.fields.TextField')()),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
        ))
        db.send_create_signal(u'news', ['TumblEvent'])

        # Deleting model 'Tumbl'
        db.delete_table(u'news_tumbl')

        # Adding field 'News.tumbl_event'
        db.add_column(u'news_news', 'tumbl_event',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl_event', null=True, on_delete=models.SET_NULL, to=orm['news.TumblEvent'], blank=True, unique=True),
                      keep_default=False)

        # Adding field 'News.tumbl_feature'
        db.add_column(u'news_news', 'tumbl_feature',
                      self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl_feature', null=True, on_delete=models.SET_NULL, to=orm['news.TumblFeature'], blank=True, unique=True),
                      keep_default=False)

        # Deleting field 'News.tumbl'
        db.delete_column(u'news_news', 'tumbl_id')


    models = {
        u'news.news': {
            'Meta': {'object_name': 'News'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tumbl': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tumbl'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tumbl']", 'blank': 'True', 'unique': 'True'}),
            'tweet': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tweet'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tweet']", 'blank': 'True', 'unique': 'True'})
        },
        u'news.tumbl': {
            'Meta': {'object_name': 'Tumbl'},
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'steam_html': ('django.db.models.fields.TextField', [], {}),
            'steam_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tagged_type': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'tid': ('django.db.models.fields.BigIntegerField', [], {}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tweet': {
            'Meta': {'object_name': 'Tweet'},
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'screen_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'tid': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        }
    }

    complete_apps = ['news']