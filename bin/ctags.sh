#!/bin/bash
dir=`dirname $0`

NODE_PATH=/usr/local/lib/jsctags jsctags --oneprog $dir/../lib/*/* $dir/../pub/app/model/* $dir/../pub/app/view/*
