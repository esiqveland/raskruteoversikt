FROM node:6

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

RUN rm -rf dist && mkdir dist
RUN npm run test
RUN npm run prod

EXPOSE 9999

ENV RAVEN_DSN "NOT_SET"
ENV NSQD_HOST ""

CMD ["npm", "start"]
