# Dockerfile para IA.AGENDAMENTOS com Backend Proxy

# Stage 1: Build do Frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /app

# Copiar package.json e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte e buildar
COPY . .
RUN npm run build

# Stage 2: Backend + Frontend buildado
FROM node:22-alpine

WORKDIR /app

# Instalar dependências do backend
RUN npm install express cors axios

# Copiar servidor backend
COPY server.js ./

# Copiar build do frontend do stage anterior
COPY --from=frontend-builder /app/dist ./dist

# Expor porta
EXPOSE 8080

# Variáveis de ambiente (serão sobrescritas pelo Cloud Run)
ENV PORT=8080
ENV NODE_ENV=production

# Iniciar servidor
CMD ["node", "server.js"]
