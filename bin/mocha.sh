#!/bin/bash
dir=`dirname $0`
NODE_ENV=test $dir/../node_modules/.bin/mocha --reporter dot --timeout 3000 --watch --growl $dir/../test/*.js
