BROWSERIFY = node_modules/.bin/browserify
WATCHIFY = node_modules/.bin/watchify
UGLIFY = node_modules/.bin/uglifyjs

.PHONY: all dist clean watch watch-site

all: dist/libs.min.js dist/site.min.js

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

dist/libs.min.js: dist/libs.js
	$(UGLIFY) dist/libs.js \
		-o dist/libs.min.js \
		--compress drop_console

dist/site.min.js: dist/site.js
	$(UGLIFY) dist/site.js \
		-o dist/site.min.js \
		--compress drop_console

clean:
	rm -f dist/*