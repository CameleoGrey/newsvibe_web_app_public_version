FROM ubuntu:22.04

WORKDIR newsvibe_web_app

RUN apt-get -y update
RUN apt-get -y install python3.10 python3-pip
RUN apt-get -y install curl
RUN apt -y install nginx
RUN python3 -m pip install wheel Flask jinja2 flask_cors gunicorn

ADD ./data data
ADD ./scripts scripts
ADD ./static static
ADD ./templates templates

ADD ./docker_utils/run_app.sh run_app.sh
ADD ./docker_utils/newsvibe_web_app /etc/nginx/sites-available/newsvibe_web_app

EXPOSE 8000

CMD sh ./run_app.sh
