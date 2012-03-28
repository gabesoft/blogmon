#!/bin/bash
dir=`dirname $0`
NODE_ENV=test $dir/../node_modules/.bin/mocha --reporter spec --timeout 5000 --watch --growl $dir/../test/*.js

