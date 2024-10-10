FROM nginx:latest

COPY ./web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
