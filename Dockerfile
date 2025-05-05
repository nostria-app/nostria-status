FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Create data directory for jsonl-db
RUN mkdir -p src/db/data && chmod -R 755 src/db/data

# Expose port that the app will run on
EXPOSE 3000

# Command to run the app
CMD ["node", "index.js"]