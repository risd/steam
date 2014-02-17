BROWSERIFY = node_modules/.bin/browserify
WATCHIFY = node_modules/.bin/watchify
UGLIFY = node_modules/.bin/uglifyjs

all: dist/site.js dist/site.nosvg.js oldbrowser

.PHONY: clean dist watch watch-site watch-site-nosvg oldbrowser

watch: dist dist/libs.js dist/libs.nosvg.js watch-site watch-site-nosvg

watch-site:
	$(WATCHIFY) src/index.js -o dist/site.js -v &
	$(WATCHIFY) src/nosvg/index.js -o dist/site.nosvg.js -v

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

dist/libs.nosvg.js: dist
	cat lib/d3.v3.js \
		lib/oldbrowser/aight.d3.min.js > dist/libs.nosvg.js

dist/site.nosvg.js: dist
	$(BROWSERIFY) src/nosvg/index.js > dist/site.nosvg.js

oldbrowser: dist
	cat lib/oldbrowser/aight.js > dist/aight.min.js

clean:
	rm -f dist/*