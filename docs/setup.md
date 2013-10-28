## Setup locally

Clone the repository

    git clone .

Install requirements

    pip install requirements.txt

Run the server wsgi server

    foreman start

Run django development server

    foreman run python manage.py runserver

## Deploying

Push to heroku

    git push heroku master

## Database

Runs on postgres. To setup the database from scratch, have a database url set in the config

    heroku config set:DATABASE_URL=

Run syncdb to setup the inital tables.

    foreman run python manage.py syncdb
    foreman run python manage.py migrate

Set up the individual application tables

    foreman run python manage.py schemamigration map --initial
    foreman run python manage.py migrate map

