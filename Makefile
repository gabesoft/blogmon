
TESTS = test/*.js
REPORTER = spec
SRC = $(shell find lib/*.js)

all: test

.PHONY: release test loc clean no_targets__ help

no_targets__:
help:
	@sh -c "$(MAKE) -rpn no_targets__ | awk -F':' '/^[a-zA-Z0-9][^\$$#\/\\t=]*:([^=]|$$)/ {split(\$$1,A,/ /);for(i in A)print A[i]}' | grep -v '__\$$' | grep -v 'Makefile' | grep -v 'make\[1\]' | sort"

tag:
	@git tag -a "v$(VERSION)" -m "Version $(VERSION)"

tag-push: tag
	@git push --tags origin HEAD:master

test: 
		@NODE_ENV=test ./node_modules/.bin/mocha \
						--reporter $(REPORTER) \
						--timeout 10000 \
						--growl \
						$(TESTS)

css:
		./node_modules/stylus/bin/stylus \
						--use nib \
						--out pub/css/ \
						--compress \
						pub/stylesheets/site.styl \
						pub/stylesheets/site.win.styl \
						pub/stylesheets/site.lin.styl

run:
	./node_modules/node-dev/bin/node-dev server.js

redis:
	redis-server /usr/local/etc/redis.conf

loc:
	@find src/ -name *.js | xargs wc -l

setup:
	@npm install . -d

clean-dep:
	@rm -rf node_modules

