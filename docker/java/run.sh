#!/bin/bash
set -e

# Compile Java solution
if [ -f /sandbox/Solution.java ]; then
    javac -d /tmp /sandbox/Solution.java 2> /tmp/compile_errors.log
    COMPILE_STATUS=$?
    if [ $COMPILE_STATUS -ne 0 ]; then
        cat /tmp/compile_errors.log >&2
        exit 1
    fi
fi

# Execute Java class against input
if [ -f /sandbox/input.txt ]; then
    java -cp /tmp Solution < /sandbox/input.txt
else
    java -cp /tmp Solution
fi
