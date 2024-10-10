FROM node:18.17 as build-env

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile

COPY . .
ENV NODE_ENV=test

RUN yarn build

FROM nginx:latest as server-env

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

WORKDIR /usr/share/nginx/html

COPY --from=build-env /out .
