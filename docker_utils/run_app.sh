#!/bin/bash

nginx -v
ln -s /etc/nginx/sites-available/newsvibe_web_app /etc/nginx/sites-enabled
nginx -t
/etc/init.d/nginx restart

cd scripts
python3 ./change_fresh_content_url.py --host newsvibe.online --port ""
python3 -m gunicorn --workers 3 --bind localhost:5000 -m 007 run_server:app
