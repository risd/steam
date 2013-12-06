BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs

all: dist clean dist/libs.js dist/site.js

node_modules: package.json
	npm install

dist:
	mkdir -p dist

dist/libs.js: dist
	cat lib/d3.v3.js \
		lib/leaflet-src.js \
		lib/leaflet.markercluster-src.js \
		lib/lgtm-standalone.js > dist/libs.js


dist/site.js: dist
	$(BROWSERIFY) src/index.js > dist/site.js

clean:
	rm -f dist/*