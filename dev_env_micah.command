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