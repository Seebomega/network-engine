FROM alpine:latest

MAINTAINER Guillaume TORRESANI <gtorresa@student.42.fr>

RUN apk add --no-cache nodejs

RUN mkdir -p /data/engine && \
	adduser -u 1000 -s /bin/bash -h /data/engine engine -D && \
	chown engine:engine /data/engine

ADD ./engine /data/engine

EXPOSE 443

RUN chown -R engine:engine /data/engine

USER engine

WORKDIR /data/engine

RUN npm install .

CMD /usr/bin/npm start