# Setting up dev environment

### Clone the repo

    git clone https://github.com/risd/steam.git

### Setup JavaScript

Ensure Node.js is installed.
    
    brew install node

Install dependencies

    cd steam/static/js && make dependencies

### Setup Python

Ensure Python is installed

    brew install python

Install dependencies

    cd ../../
    virtualenv .penv
    source .penv/bin/activate
    pip install requirements.txt

### Get an .env file with Oauth and Python application variables.

Send use the .env file for the project. put it at /steam/

### Setup Ruby

Ensure Ruby is installed
    
    brew install ruby

Install dependencies

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

## Sample dev env bash setup (python/javascript only)

    #!/usr/bin/env bash

    echo "Add homebrew to PATH"
    export PATH=/usr/local/bin:/usr/local/sbin:$PATH

    echo "Install Python Dependencies"
    brew install readline sqlite gdbm --universial

    echo "Install Python"
    brew install python --universial --framework
    export PATH=/usr/local/share/python:$PATH

    echo "Setup Symlinks"
    mkdir ~/Frameworks
    ln -s "/usr/local/Cellar/python/2.7.2/Frameworks/Python.framework" ~/Frameworks

    echo "Install pip"
    /usr/local/share/python/easy_install pip
    /usr/local/share/python/pip install --upgrade distribute

    echo "Install virtualenv"
    /usr/local/share/python/pip install virtualenv

    echo "Install Node"
    brew install node

    echo "Make virtualenv"
    /usr/local/share/python/bin/virtualenv .penv

    echo "Initialize Python env"
    source .penv/bin/activate

    echo "Install application Python dependencies"
    pip install -r requirements.txt

    echo "Install application JavaScript dependencies"
    cd static/js
    npm install

    echo "Completed setup"