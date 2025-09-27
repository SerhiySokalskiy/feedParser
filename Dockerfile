# Базовий образ Node
FROM node:20-alpine

# Робоча директорія
WORKDIR /app

# Копіюємо package.json і package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо весь код
COPY . .

# Білд TypeScript
RUN npm run build

# Виставляємо порт Fastify
EXPOSE 3000

# Запуск сервера
CMD ["npm", "start"]
