#!/bin/bash
set -e

# Compile C++ source code with optimization and standard limits
if [ -f /sandbox/solution.cpp ]; then
    g++ -O2 -std=c++17 -Wall /sandbox/solution.cpp -o /tmp/solution.out 2> /tmp/compile_errors.log
    COMPILE_STATUS=$?
    if [ $COMPILE_STATUS -ne 0 ]; then
        cat /tmp/compile_errors.log >&2
        exit 1
    fi
fi

# Execute binary against input
if [ -f /sandbox/input.txt ]; then
    /tmp/solution.out < /sandbox/input.txt
else
    /tmp/solution.out
fi
