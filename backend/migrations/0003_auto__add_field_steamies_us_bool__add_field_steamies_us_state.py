# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Steamies.us_bool'
        db.add_column(u'backend_steamies', 'us_bool',
                      self.gf('django.db.models.fields.BooleanField')(default=False),
                      keep_default=False)

        # Adding field 'Steamies.us_state'
        db.add_column(u'backend_steamies', 'us_state',
                      self.gf('django.db.models.fields.CharField')(max_length=3, null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Steamies.us_bool'
        db.delete_column(u'backend_steamies', 'us_bool')

        # Deleting field 'Steamies.us_state'
        db.delete_column(u'backend_steamies', 'us_state')


    models = {
        u'backend.individual': {
            'Meta': {'object_name': 'Individual', '_ormbases': [u'backend.Steamies']},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '100'}),
            'email_subscription': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'institution': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['backend.Institution']", 'null': 'True', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'steamies_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['backend.Steamies']", 'unique': 'True', 'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'backend.initiative': {
            'Meta': {'object_name': 'Initiative'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'backend.institution': {
            'Meta': {'object_name': 'Institution', '_ormbases': [u'backend.Steamies']},
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'representative_email': ('django.db.models.fields.EmailField', [], {'max_length': '100'}),
            'representative_first_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'representative_last_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'steamies_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['backend.Steamies']", 'unique': 'True', 'primary_key': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True'})
        },
        u'backend.steamies': {
            'Meta': {'object_name': 'Steamies'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'engaged_as': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'geohash': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'initiative': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['backend.Initiative']", 'null': 'True', 'blank': 'True'}),
            'latitude': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'longitude': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'tags': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'us_bool': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'us_state': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'work_in': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'zip_code': ('django.db.models.fields.CharField', [], {'max_length': '15'})
        }
    }

    complete_apps = ['backend']