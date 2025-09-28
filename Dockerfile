FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Спочатку генеруємо Prisma Client
RUN npx prisma generate

# Потім збираємо TypeScript
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
