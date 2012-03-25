#!/bin/bash
dir=`dirname $0`

#NODE_ENV=development node $dir/../server.js
NODE_ENV=development PORT=3000 nodemon --debug $dir/../server.js
