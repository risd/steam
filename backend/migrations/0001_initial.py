# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Initiaive'
        db.create_table(u'backend_initiaive', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'backend', ['Initiaive'])

        # Adding model 'Steamies'
        db.create_table(u'backend_steamies', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('zip_code', self.gf('django.db.models.fields.CharField')(max_length=15)),
            ('engaged_as', self.gf('django.db.models.fields.CharField')(max_length=30, null=True, blank=True)),
            ('work_in', self.gf('django.db.models.fields.CharField')(max_length=30, null=True, blank=True)),
            ('tags', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('initiaive', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['backend.Initiaive'], null=True, blank=True)),
        ))
        db.send_create_signal(u'backend', ['Steamies'])

        # Adding model 'Institution'
        db.create_table(u'backend_institution', (
            (u'steamies_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['backend.Steamies'], unique=True, primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True)),
            ('representative_first_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('representative_last_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('representative_email', self.gf('django.db.models.fields.EmailField')(max_length=100)),
        ))
        db.send_create_signal(u'backend', ['Institution'])

        # Adding model 'Individual'
        db.create_table(u'backend_individual', (
            (u'steamies_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['backend.Steamies'], unique=True, primary_key=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=100)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('institution', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['backend.Institution'], null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('email_subscription', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'backend', ['Individual'])


    def backwards(self, orm):
        # Deleting model 'Initiaive'
        db.delete_table(u'backend_initiaive')

        # Deleting model 'Steamies'
        db.delete_table(u'backend_steamies')

        # Deleting model 'Institution'
        db.delete_table(u'backend_institution')

        # Deleting model 'Individual'
        db.delete_table(u'backend_individual')


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
        u'backend.initiaive': {
            'Meta': {'object_name': 'Initiaive'},
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
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'initiaive': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['backend.Initiaive']", 'null': 'True', 'blank': 'True'}),
            'tags': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'work_in': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'zip_code': ('django.db.models.fields.CharField', [], {'max_length': '15'})
        }
    }

    complete_apps = ['backend']