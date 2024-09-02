FROM node:19.9.0

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 8081

CMD ["node", "dist/server/entry.mjs"]
