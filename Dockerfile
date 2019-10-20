FROM ubuntu:xenial

RUN apt-get update && apt-get install -y software-properties-common
RUN apt-get install -y apt-transport-https ca-certificates
RUN apt-get update && apt-get -y install curl gnupg python
RUN apt-get -y install build-essential libkrb5-dev

RUN curl -sL https://deb.nodesource.com/setup_8.x  | bash -
RUN apt-get -y install nodejs

# Downgrade npm because of cb() never called issue
# https://npm.community/t/crash-npm-err-cb-never-called/858/25
RUN npm install -g npm@5.6.0
RUN npm install -g nodemon

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68DB5E88 && \
    add-apt-repository "deb https://repo.sovrin.org/sdk/deb xenial stable" && \
    apt-get update

RUN apt-get install -y libindy=1.8.2

RUN mkdir /app

WORKDIR /app

COPY lib .

RUN dpkg -i libsovtoken_0.9.7_amd64.deb && \
    dpkg -i libvcx_0.2.41140129-e0d1c6e_amd64.deb && \
    apt-get install -f

COPY package.json .
COPY package-lock.json .

RUN npm install

RUN mkdir src
COPY src src

CMD ["node", "src/vcx-server.js"]