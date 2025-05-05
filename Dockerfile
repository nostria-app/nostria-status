# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
# Use wildcard to copy both if they exist
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Bundle app source
COPY . .

# Make port 3000 available to the world outside this container
EXPOSE 3000

# Define environment variable (optional, can be overridden)
ENV NODE_ENV production

# Run the app when the container launches
CMD [ "node", "index.js" ]

# Add a volume for the database to persist data
VOLUME /usr/src/app/db
