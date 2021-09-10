FROM node:14-alpine As development

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install glob rimraf

RUN npm install --only=development

COPY . .

RUN npm run build


FROM node:14-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --only=production

COPY . .
COPY --from=development /usr/src/app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
