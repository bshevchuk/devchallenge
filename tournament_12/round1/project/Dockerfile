FROM node:8.11

WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN npm install --production

COPY . /app

EXPOSE 8080
CMD [ "npm", "start" ]