FROM node:20-alpine

WORKDIR /app

# Копіюємо тільки package.json і lockfile
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь код
COPY . .

# Білд TypeScript
RUN npm run build

# Експортуємо порт Fastify
EXPOSE 3000

# Prisma generate + старт сервера вже після того, як є DATABASE_URL
CMD npx prisma generate && npm start
