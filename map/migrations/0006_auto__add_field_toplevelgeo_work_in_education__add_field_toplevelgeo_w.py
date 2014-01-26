# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'TopLevelGeo.work_in_education'
        db.add_column(u'map_toplevelgeo', 'work_in_education',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'TopLevelGeo.work_in_research'
        db.add_column(u'map_toplevelgeo', 'work_in_research',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'TopLevelGeo.work_in_political'
        db.add_column(u'map_toplevelgeo', 'work_in_political',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)

        # Adding field 'TopLevelGeo.work_in_industry'
        db.add_column(u'map_toplevelgeo', 'work_in_industry',
                      self.gf('django.db.models.fields.IntegerField')(default=0),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'TopLevelGeo.work_in_education'
        db.delete_column(u'map_toplevelgeo', 'work_in_education')

        # Deleting field 'TopLevelGeo.work_in_research'
        db.delete_column(u'map_toplevelgeo', 'work_in_research')

        # Deleting field 'TopLevelGeo.work_in_political'
        db.delete_column(u'map_toplevelgeo', 'work_in_political')

        # Deleting field 'TopLevelGeo.work_in_industry'
        db.delete_column(u'map_toplevelgeo', 'work_in_industry')


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
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        u'map.individual': {
            'Meta': {'object_name': 'Individual'},
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'email_subscription': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'institution': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['map.Institution']", 'null': 'True', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'map.initiative': {
            'Meta': {'object_name': 'Initiative'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'map.institution': {
            'Meta': {'object_name': 'Institution'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'representative_email': ('django.db.models.fields.EmailField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'representative_first_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'representative_last_name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'})
        },
        u'map.steamies': {
            'Meta': {'object_name': 'Steamies'},
            'avatar_url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'engaged_as': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'individual': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'individual'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['map.Individual']", 'blank': 'True', 'unique': 'True'}),
            'initiative': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['map.Initiative']", 'null': 'True', 'blank': 'True'}),
            'institution': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'institution'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['map.Institution']", 'blank': 'True', 'unique': 'True'}),
            'tags': ('django.db.models.fields.TextField', [], {'null': 'True', 'blank': 'True'}),
            'top_level': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'top_level'", 'null': 'True', 'to': u"orm['map.TopLevelGeo']"}),
            'top_level_input': ('django.db.models.fields.CharField', [], {'max_length': '75', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.OneToOneField', [], {'related_name': "'steamies'", 'null': 'True', 'on_delete': 'models.SET_NULL', 'to': u"orm['auth.User']", 'blank': 'True', 'unique': 'True'}),
            'work_in': ('django.db.models.fields.CharField', [], {'max_length': '30', 'null': 'True', 'blank': 'True'})
        },
        u'map.toplevelgeo': {
            'Meta': {'object_name': 'TopLevelGeo'},
            'country': ('django.db.models.fields.CharField', [], {'max_length': '75', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'lat': ('django.db.models.fields.DecimalField', [], {'max_digits': '7', 'decimal_places': '5'}),
            'lon': ('django.db.models.fields.DecimalField', [], {'max_digits': '8', 'decimal_places': '5'}),
            'us_bool': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'us_district': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'us_district_ordinal': ('django.db.models.fields.CharField', [], {'max_length': '4', 'null': 'True', 'blank': 'True'}),
            'us_state': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'us_state_abbr': ('django.db.models.fields.CharField', [], {'max_length': '4', 'null': 'True', 'blank': 'True'}),
            'work_in_education': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'work_in_industry': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'work_in_political': ('django.db.models.fields.IntegerField', [], {'default': '0'}),
            'work_in_research': ('django.db.models.fields.IntegerField', [], {'default': '0'})
        }
    }

    complete_apps = ['map']