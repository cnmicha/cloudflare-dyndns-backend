FROM node:14-alpine As development

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install glob rimraf

RUN npm install

RUN npm run build


FROM node:14-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/package*.json ./
COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000

RUN ls -al
RUN ls -al dist/
CMD ["npm", "run", "start:prod"]
