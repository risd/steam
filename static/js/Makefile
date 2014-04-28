BROWSERIFY = node_modules/.bin/browserify
WATCHIFY = node_modules/.bin/watchify

.PHONY: all dist clean watch watch-site

all: dist/bundle.js

watch: watch-site

watch-site: dist/libs.js
	$(WATCHIFY) src/index.js -o dist/site.js -v
	cat dist/libs.js dist/site.js > dist/bundle.js

dependencies: package.json
	npm install

dist:
	mkdir -p dist

dist/libs.js: dist
	cat lib/d3.v3.js \
		lib/leaflet-src.js \
		lib/leaflet.markercluster-src.js \
		lib/leaflet-divIconWithData.js \
		lib/mapbox.standalone.js > dist/libs.js

dist/site.js: dist
	$(BROWSERIFY) src/index.js > dist/site.js

dist/bundle.js: dist/libs.js dist/site.js
	cat dist/libs.js dist/site.js > dist/bundle.js

clean:
	rm -f dist/*