#!/bin/bash

# usage redis-del dbindex pattern*
redis-cli -n $1 KEYS $2 | awk '{print $1}' | xargs redis-cli -n $1 DEL {}
