FROM node:19.9.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

ENV ASTRO_DATABASE_FILE=/home/icass/astro-web-browser/production_database.db

RUN pnpm run build

EXPOSE 8081

CMD ["node", "dist/server/entry.mjs"]
