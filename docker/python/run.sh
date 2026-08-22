#!/bin/bash
set -e

# Execute Python source code
if [ -f /sandbox/input.txt ]; then
    python3 /sandbox/solution.py < /sandbox/input.txt
else
    python3 /sandbox/solution.py
fi
