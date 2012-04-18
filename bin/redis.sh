#!/bin/bash
dir=`dirname $0`

sudo redis-server $dir/../redis.conf

