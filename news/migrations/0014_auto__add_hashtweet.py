# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'HashTweet'
        db.create_table(u'news_hashtweet', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tid', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('user', self.gf('django.db.models.fields.CharField')(max_length=16)),
            ('screen_name', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('html', self.gf('django.db.models.fields.TextField')()),
            ('timestamp', self.gf('django.db.models.fields.DateTimeField')()),
            ('epoch_timestamp', self.gf('django.db.models.fields.IntegerField')()),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200)),
            ('text', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'news', ['HashTweet'])


    def backwards(self, orm):
        # Deleting model 'HashTweet'
        db.delete_table(u'news_hashtweet')


    models = {
        u'news.hashtweet': {
            'Meta': {'object_name': 'HashTweet'},
            'epoch_timestamp': ('django.db.models.fields.IntegerField', [], {}),
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'screen_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'text': ('django.db.models.fields.TextField', [], {}),
            'tid': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        },
        u'news.news': {
            'Meta': {'object_name': 'News'},
            'epoch_timestamp': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tumbl': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tumbl'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tumbl']", 'blank': 'True', 'unique': 'True'}),
            'tweet': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tweet'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tweet']", 'blank': 'True', 'unique': 'True'})
        },
        u'news.tumbl': {
            'Meta': {'object_name': 'Tumbl'},
            'epoch_timestamp': ('django.db.models.fields.IntegerField', [], {}),
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'state': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'steam_html': ('django.db.models.fields.TextField', [], {}),
            'steam_url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'tagged_type': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'ticker_timestamp': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'tid': ('django.db.models.fields.BigIntegerField', [], {}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'title': ('django.db.models.fields.CharField', [], {'default': "''", 'max_length': '50'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'})
        },
        u'news.tweet': {
            'Meta': {'object_name': 'Tweet'},
            'epoch_timestamp': ('django.db.models.fields.IntegerField', [], {}),
            'html': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'screen_name': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'text': ('django.db.models.fields.TextField', [], {}),
            'tid': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'timestamp': ('django.db.models.fields.DateTimeField', [], {}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        }
    }

    complete_apps = ['news']