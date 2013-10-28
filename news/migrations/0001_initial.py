# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Tweet'
        db.create_table(u'news_tweet', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.CharField')(max_length=16)),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=50)),
            ('twitter_id', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('created_at', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal(u'news', ['Tweet'])

        # Adding model 'Tumbl'
        db.create_table(u'news_tumbl', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('content', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'news', ['Tumbl'])

        # Adding model 'News'
        db.create_table(u'news_news', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tweet', self.gf('django.db.models.fields.related.OneToOneField')(related_name='tweet', null=True, on_delete=models.SET_NULL, to=orm['news.Tweet'], blank=True, unique=True)),
            ('tumbl', self.gf('django.db.models.fields.related.OneToOneField')(related_name='tumbl', null=True, on_delete=models.SET_NULL, to=orm['news.Tumbl'], blank=True, unique=True)),
        ))
        db.send_create_signal(u'news', ['News'])


    def backwards(self, orm):
        # Deleting model 'Tweet'
        db.delete_table(u'news_tweet')

        # Deleting model 'Tumbl'
        db.delete_table(u'news_tumbl')

        # Deleting model 'News'
        db.delete_table(u'news_news')


    models = {
        u'news.news': {
            'Meta': {'object_name': 'News'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tumbl': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tumbl'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tumbl']", 'blank': 'True', 'unique': 'True'}),
            'tweet': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'tweet'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['news.Tweet']", 'blank': 'True', 'unique': 'True'})
        },
        u'news.tumbl': {
            'Meta': {'object_name': 'Tumbl'},
            'content': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'news.tweet': {
            'Meta': {'object_name': 'Tweet'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '50'}),
            'created_at': ('django.db.models.fields.DateTimeField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'twitter_id': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'user': ('django.db.models.fields.CharField', [], {'max_length': '16'})
        }
    }

    complete_apps = ['news']