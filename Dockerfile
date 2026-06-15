FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y apache2 python3 python3-pip python3-venv libapache2-mod-wsgi-py3


RUN a2enmod wsgi

COPY . /var/www/html/ATI/
RUN python3 -m venv /var/www/html/ATI/venv
RUN /var/www/html/ATI/venv/bin/pip install beaker

RUN echo 'WSGIDaemonProcess ati python-home=/var/www/html/ATI/venv python-path=/var/www/html/ATI' > /etc/apache2/conf-available/wsgi-ati.conf \
    && echo 'WSGIScriptAlias /ATI/index.py /var/www/html/ATI/index.py' >> /etc/apache2/conf-available/wsgi-ati.conf \
    && echo 'WSGIScriptAlias /ATI/profile.py /var/www/html/ATI/profile.py' >> /etc/apache2/conf-available/wsgi-ati.conf \
    && echo '<Directory /var/www/html/ATI>' >> /etc/apache2/conf-available/wsgi-ati.conf \
    && echo '    WSGIProcessGroup ati' >> /etc/apache2/conf-available/wsgi-ati.conf \
    && echo '    WSGIApplicationGroup %{GLOBAL}' >> /etc/apache2/conf-available/wsgi-ati.conf \
    && echo '    Require all granted' >> /etc/apache2/conf-available/wsgi-ati.conf \
    && echo '</Directory>' >> /etc/apache2/conf-available/wsgi-ati.conf

RUN a2enconf wsgi-ati

EXPOSE 80

CMD ["apachectl", "-D", "FOREGROUND"]


