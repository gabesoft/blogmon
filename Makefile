
TESTS = test/*.js
REPORTER = dot
SRC = $(shell find lib/*.js)

test: 
		@NODE_ENV=test ./node_modules/.bin/mocha \
						--reporter $(REPORTER) \
						$(TESTS)

.PHONY: test
