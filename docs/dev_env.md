# Setting up dev environment

### Clone the repo

    git clone https://github.com/risd/steam.git

### Setup JavaScript

    cd steam/static/js && make dependencies

### Setup Python
    
    cd ../../
    virtualenv .penv
    source .penv/bin/activate
    pip install requirements.txt

### Get an .env file with Oauth and Python application variables.

Send use the .env file for the project. put it at /steam/

### Setup Ruby

    curl -L https://get.rvm.io | bash
    source ~/.rvm/scripts/rvm
    rvm install 1.9.3
    rvm use 1.9.3
    rvm gemset create steam-proto
    rvm gemset use steam-proto
    gem install bundler
    bundle install

### Do work!

Either run ./dev_env/do_work.command, or run:

    source ~/.rvm/scripts/rvm
    rvm use 1.9.3
    rvm gemset use steam-proto
    open http://localhost:5000/map/
    foreman start --procfile Procfile.dev

## Deploying

Push to heroku

    git push heroku master

### Database

Runs on postgres. To setup the database from scratch, have a database url set in your `.env` file and on heroku's config

    heroku config set:DATABASE_URL=

Run syncdb to setup the inital tables.

    foreman run python manage.py syncdb
    foreman run python manage.py migrate
