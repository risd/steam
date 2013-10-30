# -*- coding: utf-8 -*-
from pyquery import PyQuery as pq


class CommonHTML():
    """docstring for Common HTML"""
    def __init__(self):
        pass

    def share(self):
        share_wrapper = pq('<ul></ul>')\
            .attr('class', 'sharing clear-fix')

        share_wrapper\
            .append(u'<li>share:</li>')\
            .append(u'<li class="icon">t</li>')\
            .append(u'<li class="icon">F</li>')\
            .append(u'<li class="icon">Å</li>')

        return share_wrapper

    def filter(self, type):
        post_filter = pq('<p></p>')\
            .attr('class', 'filter-type')\
            .html(type)

        return post_filter

    def post_date(self, dt):
        """ takes in datetime object, returns post-date ul struct"""
        post_date_ul = pq('<ul></ul>')\
            .attr('class', 'post-date one-column offset-one')

        post_date_li_md = pq('<li></li>')\
            .html(dt.strftime('%b. %d').lstrip('0'))
        post_date_li_y = pq('<li></li>')\
            .html(dt.strftime('%Y'))

        post_date_ul.append(post_date_li_md)\
                    .append(post_date_li_y)

        return post_date_ul
