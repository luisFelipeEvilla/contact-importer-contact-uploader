FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD node ./db/setup.js && node index.js   