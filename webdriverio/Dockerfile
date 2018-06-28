FROM node:6

ENV NODE_PATH /install/node_modules/
ENV PATH /install/node_modules/.bin:$PATH

COPY package.json /install/package.json
WORKDIR /install/
RUN npm install

VOLUME /app
WORKDIR /app

RUN apt-get update; \
    apt-get install -y --fix-missing unzip openjdk-7-jdk; \
    wget http://download.java.net/glassfish/4.1/release/glassfish-4.1.zip; \
    unzip glassfish-4.1.zip;

ENV PATH /app/glassfish4/glassfish/bin:$PATH

RUN apt-get install -y --fix-missing mongodb-clients mongodb-dev;