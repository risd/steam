# Scaling

This application has two processes. A `web` and a `clock` process. The `web` process is the web application, and the `clock` process writes static files based on the database periodically.

On Heroku each process can be scaled by changing the number of computing resources bing used to power that process.

The minimum for this applicaiton will be `web` using 2 dynos, and the clock using 1.

```Bash
# if using heroku-accounts
heroku accounts:set risd_media

# scale the processes to N dynos
heroku ps:scale web=2
heroku ps:scale clock=1
```


## Monitoring

Heroku has an experimental feature referred to as [`log-runtime-metrics`](https://devcenter.heroku.com/articles/log-runtime-metrics), which will log performance metrics of CPU and memory load. These are made visible in the [log2viz](http://log2viz.herokuapp.com/app/stemtosteam) application.


## Logs

Persistent logs were previously being provided by loggly. The heroku loggly plugin has been updated, and has not yet been re-integrated.