FROM node:20

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY package-lock.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

RUN rm -rf build && mkdir build
#RUN npm run test
RUN npm run build

WORKDIR /usr/src/app/server

RUN npm install

EXPOSE 9999

ENV RAVEN_DSN "NOT_SET"

CMD ["npm", "start"]
