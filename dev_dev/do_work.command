#!/usr/bin/env bash

# setup ruby
source ~/.rvm/scripts/rvm
rvm use 1.9.3

# gemset for project
rvm gemset use steam-proto

# open browser to URL defined in Procfile.dev
open http://localhost:5000/map/

## Change directory to application
## -
ROOT="$( dirname "$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )")"

cd "$ROOT"

# start the party
foreman start --procfile Procfile.dev