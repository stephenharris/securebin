# base image
FROM node:10

ARG HOST_USER_UID=1000
ARG HOST_USER_GID=1000

# add `/usr/src/app/node_modules/.bin` to $PATH
ENV PATH /home/app/node_modules/.bin:$PATH

# install and cache app dependencies
RUN useradd --user-group --create-home --shell /bin/false app

# Give node the same permissions as the host user
RUN groupmod -g $HOST_USER_GID node && usermod -u $HOST_USER_UID -g $HOST_USER_GID node

ENV HOME=/home/node
WORKDIR /home/node

USER node
COPY package.* /home/node/

RUN npm install

# start app
CMD npm run start:dev