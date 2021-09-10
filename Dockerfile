FROM node:14-alpine As development

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN npm install --only=development

RUN npm run build


FROM node:14-alpine As production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY . .
COPY --from=development /usr/src/app/dist ./dist

RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
