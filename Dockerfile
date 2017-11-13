FROM marvambass/nginx-ssl-secure

COPY ./www/ /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/

ENV DH_SIZE=1024

