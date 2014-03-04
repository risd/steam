BROWSERIFY = node_modules/.bin/browserify
WATCHIFY = node_modules/.bin/watchify

.PHONY: all dist clean watch watch-site

all: dist/libs.js dist/site.js

watch: dist/libs.js watch-site

watch-site:
	$(WATCHIFY) src/index.js -o dist/site.js -v

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

clean:
	rm -f dist/*