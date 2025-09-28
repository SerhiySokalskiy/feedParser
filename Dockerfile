# Базовий образ Node
FROM node:20-alpine

# Робоча директорія
WORKDIR /app

# Копіюємо package.json і package-lock.json
COPY package*.json ./

# Встановлюємо залежності (включаючи dev, щоб був prisma)
RUN npm install --include=dev

# Копіюємо весь код
COPY . .

# Білд TypeScript
RUN npm run build

# Генерація Prisma-клієнта (в runtime, після того як Render підставить DATABASE_URL)
CMD npx prisma generate && npm start

# Виставляємо порт Fastify
EXPOSE 3000
