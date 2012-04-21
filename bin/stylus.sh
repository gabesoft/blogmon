#!/bin/bash
dir=`dirname $0`

$dir/../node_modules/stylus/bin/stylus -u nib --out $dir/../pub/css --watch $dir/../pub/stylesheets

