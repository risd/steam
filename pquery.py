from pyquery import PyQuery as pq

from news.sources.tumbl import Tumbl

tumbl = Tumbl({
        u'body': u'<p><img src="http://media.tumblr.com/60b068560acd1c354ec4448c9f610641/tumblr_inline_mve72aWLwi1spm8pz.jpg"/></p>\n<p>RISD kicked off a series of ongoing national conversations about Art + Design and the future of healthcare with the two-day symposium \u201cMake It Better,\u201d sponsored by the Robert Wood Johnson Foundation\u2019s\xa0<em>Pioneer Portfolio.</em></p>\n<p>\u201cMake It Better\u201d brought leading artists and designers together with health professionals, policy makers, and entrepreneurs to discuss the ways in which Art + Design are uniquely capable of improving public health and the delivery of healthcare.</p>\n<p>Presentations like\xa0 \u201cPublic Practices: Artists, Designers and Health Activism\u201d addressed the human need for physical spaces, products, policies and messages that offer fresh and effective approaches to maintaining personal health and delivering excellent quality care.\xa0 Participants enjoyed a welcome from Rhode Island Senator Sheldon Whitehouse and talks from these keynote speakers:</p>\n<p><strong>Howard K. Koh</strong><br/><em>Assistant Secretary for Health,<br/>U.S. Department of Health and Human Services</em></p>\n<p><strong>Mel Chin</strong><br/><em>Artist</em></p>\n<p><strong>Sara Diamond</strong><br/><em>President, OCAD University</em></p>\n<p><strong>Donna Garland</strong><br/><em>Associate Director for Communication,<br/>Centers for Disease Control<br/>and Prevention</em></p>\n<p><strong>Raynard Kington</strong><br/><em>President, Grinnell College</em></p>',
        u'highlighted': [],
        u'reblog_key': u'KheTEeJK',
        u'format': u'html',
        u'timestamp': 1382986349,
        u'note_count': 0,
        u'tags': [u'event'],
        u'id': 65354156316,
        u'post_url': u'http://risd-media-dev.tumblr.com/post/65354156316/make-it-better',
        u'state': u'published',
        u'short_url': u'http://tmblr.co/ZYXD4qytQKaS',
        u'date': u'2013-10-28 18:52:29 GMT',
        u'title': u'Make it Better',
        u'type': u'text',
        u'slug': u'make-it-better',
        u'blog_name': u'risd-media-dev'
    })

print tumbl.steam_html
