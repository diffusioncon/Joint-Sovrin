FROM ubuntu:xenial

RUN apt-get update && apt-get install -y software-properties-common
RUN apt-get install -y apt-transport-https ca-certificates
RUN apt-get update && apt-get -y install curl gnupg python
RUN apt-get -y install build-essential libkrb5-dev

RUN curl -sL https://deb.nodesource.com/setup_8.x  | bash -
RUN apt-get -y install nodejs

#ENV NVM_VERSION v0.33.11
#ENV NODE_VERSION v8.12.0
#ENV NVM_DIR /usr/local/nvm
#RUN mkdir $NVM_DIR
#RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
#
#ENV NODE_PATH $NVM_DIR/$NODE_VERSION/lib/node_modules
#ENV PATH $NVM_DIR/versions/node/$NODE_VERSION/bin:$PATH
#
#RUN echo "source $NVM_DIR/nvm.sh && \
#    nvm install $NODE_VERSION && \
#    nvm alias default $NODE_VERSION && \
#    nvm use default" | bash

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

#RUN dpkg -i libsovtoken_0.9.6_amd64.deb && \
#    dpkg -i libvcx_0.1.27328536-fb7b7b6_amd64.deb && \
#    dpkg -i verity-ui_0.1.433_all.deb && \
#    apt-get install -f

COPY package.json .
COPY package-lock.json .

RUN npm install

RUN mkdir src
COPY src src

CMD ["node", "src/vcx-server.js"]

# RUN tar zxvf node-vcx-wrapper_0.2.41140129-e0d1c6e_amd64.tgz