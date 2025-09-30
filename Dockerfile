FROM node:20-alpine

WORKDIR /app

# Копіюємо package.json і встановлюємо залежності
COPY package*.json ./
RUN npm install

# Копіюємо код у контейнер
COPY . .

# Генеруємо Prisma Client
RUN npx prisma generate

# Збираємо TypeScript
RUN npm run build

# Встановлюємо Redis із пакета Alpine
RUN apk add --no-cache redis

# Відкриваємо порти для API та Redis
EXPOSE 3000 6379

# Запускаємо Redis у фоні та Node API
CMD sh -c "redis-server --appendonly yes & npm start"
