# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Deleting model 'Initiaive'
        db.delete_table(u'backend_initiaive')

        # Adding model 'Initiative'
        db.create_table(u'backend_initiative', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'backend', ['Initiative'])

        # Deleting field 'Steamies.initiaive'
        db.delete_column(u'backend_steamies', 'initiaive_id')

        # Adding field 'Steamies.initiative'
        db.add_column(u'backend_steamies', 'initiative',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['backend.Initiative'], null=True, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Adding model 'Initiaive'
        db.create_table(u'backend_initiaive', (
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'backend', ['Initiaive'])

        # Deleting model 'Initiative'
        db.delete_table(u'backend_initiative')

        # Adding field 'Steamies.initiaive'
        db.add_column(u'backend_steamies', 'initiaive',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['backend.Initiaive'], null=True, blank=True),
                      keep_default=False)

        # Deleting field 'Steamies.initiative'
        db.delete_column(u'backend_steamies', 'initiative_id')


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
            'work_in': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'zip_code': ('django.db.models.fields.CharField', [], {'max_length': '15'})
        }
    }

    complete_apps = ['backend']