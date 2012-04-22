#!/bin/bash
dir=`dirname $0`

# TODO: use the --compress option for production
#       remove  --firebug & --line-numbers

$dir/../node_modules/stylus/bin/stylus \
  --use nib \
  --out $dir/../pub/css \
  --watch $dir/../pub/stylesheets \
  --line-numbers
