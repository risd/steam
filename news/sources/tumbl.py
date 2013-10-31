# -*- coding: utf-8 -*-

import logging
from datetime import datetime
import pytz

from pyquery import PyQuery as pq

from .common import CommonHTML

logger = logging.getLogger(__name__)
common = CommonHTML()


class Tumbl():
    """docstring for Tumbls"""
    def __init__(self, post):
        # respond data from Tumblr
        self.post = post

        # variables to be initialized
        # based on the Tumblr response
        self.type = None
        self.tid = None
        self.html = None
        self.url = None
        self.title = None
        self.state = None
        self.steam_html = None
        self.steam_url = None
        self.timestamp = None

        # tracks status of the object
        # being in the database or not
        self.exists_in_database = False

        # kick it all off
        self.setup()

    def _html_feature(self):
        """ take in self, set html, return self """
        # p - holds original post, with div around it
        # s - holds steam html

        p = pq(self.html)

        # each bit to be appended into steam html, s
        feature = '<section class="content feature">' +\
                  '</section>'

        title_container = pq('<div></div>')\
            .attr('class', 'feature-title-container ' +
                           'full-width clearfix')

        title = '<h2 class="feature-title five-column">' +\
                self.title +\
                '</h2>'
        header_img = p('div > p:first-child').html()

        header_img = pq(header_img)\
            .attr('class', 'feature-img full-width')

        post_container = pq('<div></div>')\
            .attr('class', 'grid full-width clearfix')

        post_date_ul = common.post_date(self.timestamp)

        post_wrapper = pq('<div></div>')\
            .attr('class', 'post three-column clearfix')

        post_filter = common.filter(self.type)

        share_wrapper = common.share()

        post_wrapper.append(post_filter)
        post_wrapper.append(
            p.remove('p:first-child'))
        post_wrapper.append(share_wrapper)

        title_container.append(title)
        title_container.append(header_img)

        post_container.append(post_date_ul)
        post_container.append(post_wrapper)

        s = pq(feature)
        s.append(title_container)
        s.append(post_container)

        self.steam_html = unicode(s)

        return self

    def _html_event(self):
        """ take in self, set html, return self """
        # p - holds original post, with div around it
        # s - holds steam html

        p = pq(self.html)

        # each bit to be appended into steam html, s
        event = '<section class="content event">' +\
                '</section>'

        event_wrapper = pq('<div></div>')\
            .attr('class', 'grid full-width clearfix')

        event_wrapper.append(common.post_date(self.timestamp))

        event_container = pq('<div></div>')\
            .attr('class', 'post clearfix three-column')

        post_filter = common.filter(self.type)

        title = pq('<h3></h3>')\
            .html(self.title)


        event_container\
            .append(post_filter)\
            .append(title)\
            .append(p)\
            .append(common.share())

        event_wrapper.append(event_container)

        s = pq(event)
        s.append(event_wrapper)

        self.steam_html = unicode(s)

        return self

    def _create_html(self):
        # converts tumblr html to steam html
        if self.type == 'feature':
            self._html_feature()
        elif self.type == 'event':
            self._html_event()

        # make this work
        return self

    def _create_url(self):
        # converts tumblr slug into steam url

        # for now, we can assume this will
        # be on continuously loading page.
        # so these slugs will be anchors
        # in the page
        self.steam_url = self.post[u'slug']

        return self

    def _create_timestamp(self):
        self.timestamp = datetime\
            .utcfromtimestamp(self.post[u'timestamp'])\
            .replace(tzinfo=pytz.utc)

        return self

    def setup(self):
        if u'feature' in self.post[u'tags']:
            self.type = 'feature'

        elif u'event' in self.post[u'tags']:
            self.type = 'event'

        else:
            self.type = None
            err = 'Tumblr post that was not an ' +\
                'event, or a feature. ' +\
                '{0}'.format(self.post[u'tags'])
            logging.error(err)

        self.tid = self.post[u'id']
        self.html = self.post[u'body']
        self.url = self.post[u'post_url']
        self.title = self.post[u'title']
        self.state = self.post[u'state']

        # based on the variables above,
        # set the steam variables
        self._create_timestamp()\
            ._create_url()\
            ._create_html()

        return self

    def data(self):
        return self.type, {
            'tid': self.tid,
            'html': self.html,
            'url': self.url,
            'title': self.title,
            'state': self.state,
            'steam_html': self.steam_html,
            'steam_url': self.steam_url,
            'timestamp': self.timestamp,
        }
