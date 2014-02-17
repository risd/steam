# Costs

- [Heroku. Hosting platform.](#heroku)
- [MapBox. Map tile service.](#mapbox)

## Heroku

Heroku bills by per server, which they call a "dyno", and by database. You can also get addons such as caching layers and application monitoring but we aren't using any. The more traffic your site is getting, the more dyno's may be required to handle the number of requests.

We are at minimum, using:

- 2 web dyno
    - $33/month
    - to serve the web application. if we only use 1, it will fall asleep, and the initial load after an hour of inactivity will be delayed a few seconds.
- 1 worker dyno
    - to create static resources that are used by the application.
    - $34.50/month
- database. "hobby basic" plan.
    - $9/month
    - up to 4 hours downtime a month

$79.50/month total.


If more than ~5 million people sign up, we will need to upgrade database plans, to one that costs $50/month, has 1 hour of downtime per month, and will allow an unlimited number of people to sign up.

During development, to minimize costs, we have only been running 1 web dyno, and no worker dynos. This has been $9/month.


## MapBox

Mapbox charges per "map view", which equates to 15 tiles. A tile is a 256x256 pixel image. The number of tiles that is loaded will depend on the width and height of the screen. Every pan and zoom interaction will require more tiles to be loaded to fill the screen. Serving map tiles for he entire world, at many zoom levels will more quickly rack up map views than say, having a map that has two zoom levels of Providence.

Plans break out into the following tiers.

- 3,000 map views  free
- 10,000           $5  / month
- 100,000          $49 / month


In between plans, you pay $0.50 USD per 1,000 map views until you upgrade plans.

During development, to minimize costs, we have running with less than 3,000 map views, or no tiles. This has been free.
