#!/usr/bin/env bash

# setup python
source .penv/bin/activate

# setup ruby
source ~/.rvm/scripts/rvm
rvm use 1.9.3

# gemset for project
rvm gemset use steam-proto

# open browser to URL defined in Procfile.dev
open http://localhost:5000/map/

# start the party
foreman start --procfile Procfile.dev