
TESTS = test/*.js
REPORTER = spec
SRC = $(shell find lib/*.js)

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
						pub/stylesheets/

.PHONY: test
