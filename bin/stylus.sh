#!/bin/bash
dir=`dirname $0`

# TODO: use the --compress option for production

$dir/../node_modules/stylus/bin/stylus \
  --use nib \
  --out $dir/../pub/css \
  --watch $dir/../pub/stylesheets \
  --firebug \
  --line-numbers

