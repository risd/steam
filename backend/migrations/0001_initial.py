# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Initiative'
        db.create_table(u'backend_initiative', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
        ))
        db.send_create_signal(u'backend', ['Initiative'])

        # Adding model 'Institution'
        db.create_table(u'backend_institution', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True)),
            ('representative_first_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('representative_last_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('representative_email', self.gf('django.db.models.fields.EmailField')(max_length=100)),
        ))
        db.send_create_signal(u'backend', ['Institution'])

        # Adding model 'Individual'
        db.create_table(u'backend_individual', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('email', self.gf('django.db.models.fields.EmailField')(max_length=100)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=200, null=True, blank=True)),
            ('institution', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['backend.Institution'], null=True, blank=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('email_subscription', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal(u'backend', ['Individual'])

        # Adding model 'Steamies'
        db.create_table(u'backend_steamies', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.OneToOneField')(related_name='steamies', null=True, on_delete=models.SET_NULL, to=orm['auth.User'], blank=True, unique=True)),
            ('zip_code', self.gf('django.db.models.fields.CharField')(max_length=15)),
            ('top_level', self.gf('django.db.models.fields.CharField')(max_length=3, null=True, blank=True)),
            ('individual', self.gf('django.db.models.fields.related.OneToOneField')(related_name='individual', null=True, on_delete=models.SET_NULL, to=orm['backend.Individual'], blank=True, unique=True)),
            ('institution', self.gf('django.db.models.fields.related.OneToOneField')(related_name='institution', null=True, on_delete=models.SET_NULL, to=orm['backend.Institution'], blank=True, unique=True)),
            ('engaged_as', self.gf('django.db.models.fields.CharField')(max_length=30, null=True, blank=True)),
            ('work_in', self.gf('django.db.models.fields.CharField')(max_length=30, null=True, blank=True)),
            ('tags', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('description', self.gf('django.db.models.fields.TextField')(null=True, blank=True)),
            ('initiative', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['backend.Initiative'], null=True, blank=True)),
        ))
        db.send_create_signal(u'backend', ['Steamies'])


    def backwards(self, orm):
        # Deleting model 'Initiative'
        db.delete_table(u'backend_initiative')

        # Deleting model 'Institution'
        db.delete_table(u'backend_institution')

        # Deleting model 'Individual'
        db.delete_table(u'backend_individual')

        # Deleting model 'Steamies'
        db.delete_table(u'backend_steamies')


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        u'backend.individual': {
            'Meta': {'object_name': 'Individual'},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '100'}),
            'email_subscription': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'institution': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['backend.Institution']", 'null': 'True', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
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
            'Meta': {'object_name': 'Institution'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'representative_email': ('django.db.models.fields.EmailField', [], {'max_length': '100'}),
            'representative_first_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'representative_last_name': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True'})
        },
        u'backend.steamies': {
            'Meta': {'object_name': 'Steamies'},
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'engaged_as': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'individual': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'individual'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['backend.Individual']", 'blank': 'True', 'unique': 'True'}),
            'initiative': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['backend.Initiative']", 'null': 'True', 'blank': 'True'}),
            'institution': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'institution'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['backend.Institution']", 'blank': 'True', 'unique': 'True'}),
            'tags': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'top_level': ('django.db.models.fields.CharField', [], {'max_length': '3', 'null': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'steamies'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['auth.User']", 'blank': 'True', 'unique': 'True'}),
            'work_in': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            'zip_code': ('django.db.models.fields.CharField', [], {'max_length': '15'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['backend']