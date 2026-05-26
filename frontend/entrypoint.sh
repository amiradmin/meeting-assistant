#!/bin/sh
set -e

# Replace API URL in JS files if environment variable is set
if [ ! -z "$REACT_APP_API_URL" ]; then
    find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|REPLACE_API_URL|$REACT_APP_API_URL|g" {} \;
fi

# Execute the main command
exec "$@"