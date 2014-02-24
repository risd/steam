### left off

- sorted bug on frontend, select_geo wasn't returning a value out of the united states.

- make multiple requests for networks
    - highlight
        - you have user data, just wait for tlg metadata
    - create
        - get tlg metadata
            api.toplevelgeo_request
            http://localhost:5000/api/v1/toplevelgeo/342/?format=json
        - first batch of steamies
            network_steamies_request
            http://localhost:5000/api/v1/network/342/steamies/?format=json


- networkStore.
    - update resources.py for pagination on nested resources
        https://github.com/toastdriven/django-tastypie/issues/1031
        https://github.com/toastdriven/django-tastypie/blob/master/docs/cookbook.rst#nested-resources
        https://gist.github.com/imom0/4432602
    - deal with highlight
    - make a network.update

- be sure no svgs are being appended to the DOM, seems to cause real problems.

- | uglify > `site.min.js` and link to that in map.html

- remove `window.state` from `modalFlow.js`

- push state? how does the back button work through all of this?
    - http://programming.oreilly.com/2014/01/pushstate-to-the-future-progressive-enhancement-using-html5-pushstate-at-twitter.html

    - consider for:
        - current network being shown? go back between them?

        - most of the application is a single state. you are logged in, you can log out. you are looking at a network, you can close it. you aren't flipping through a bunch of lists.

- error reporting
    - https://www.getsentry.com/pricing/
        - could use a trial
    - https://airbrake.io/

- performance monitoring
    - http://newrelic.com/backtowork

- [`waitress` over `gunicorn`?](http://thechangelog.com/waitress-a-better-python-wsgi-server-for-heroku/?utm_content=bufferdb582&utm_medium=social&utm_source=twitter.com&utm_campaign=buffer)

- language considerations
    - work in, make it clear to simply choose one above all
    - steam description, 'how do you engage with STEAM'
    - 'Join the Movement' modal header should be in sync with the buttons to get you there, which say 'Add Me', at the moment.


@babette, ask about what kind of links you want to send out?
    - WA state? WA 8th district? both?