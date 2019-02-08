FROM node:10
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
EXPOSE 80
EXPOSE 443
CMD ["npm", "run", "build"]
CMD ["npm", "start"]