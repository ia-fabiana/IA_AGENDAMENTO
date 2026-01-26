# Dockerfile para IA.AGENDAMENTOS com Backend Proxy
# Build multi-stage otimizado

# Stage 1: Build do Frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar package.json e instalar TODAS as dependências
COPY package*.json ./
RUN npm install

# Copiar código fonte
COPY . .

# Buildar frontend
RUN npm run build

# Stage 2: Produção (Backend + Frontend)
FROM node:22-alpine

WORKDIR /app

# Copiar package.json e instalar apenas dependências de produção
COPY package*.json ./
RUN npm install --production

# Copiar servidor backend
COPY server.js ./

# Copiar build do frontend
COPY --from=builder /app/dist ./dist

# Expor porta
EXPOSE 8080

# Variáveis de ambiente
ENV PORT=8080
ENV NODE_ENV=production

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar servidor
CMD ["node", "server.js"]
