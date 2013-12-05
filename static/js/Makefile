BROWSERIFY = node_modules/.bin/browserify
UGLIFY = node_modules/.bin/uglifyjs

all: dist clean dist/site.js

dist:
	mkdir -p dist

dist/site.js: dist
	$(BROWSERIFY) src/index.js > dist/site.js --noparse=lgtm

clean:
	rm -f dist/*