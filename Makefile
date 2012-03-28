
TESTS = test/*.js
REPORTER = spec
SRC = $(shell find lib/*.js)

test: 
		@NODE_ENV=test ./node_modules/.bin/mocha \
						--reporter $(REPORTER) \
						--timeout 5000 \
						--growl \
						$(TESTS)

.PHONY: test
