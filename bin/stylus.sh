#!/bin/bash
dir=`dirname $0`

$dir/../node_modules/stylus/bin/stylus \
  --use nib \
  --out $dir/../pub/css \
  --watch $dir/../pub/stylesheets \
  --compress \
  $dir/../pub/stylesheets/site.styl \
  $dir/../pub/stylesheets/site.win.styl
