import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Configurações da Evolution API
const EVOLUTION_URL = process.env.EVOLUTION_URL || 'http://95.217.232.92:8080';
const EVOLUTION_KEY = process.env.EVOLUTION_KEY || 'B6WWCSGQ-6SJAIRO-PJSJAS90-VNGZIR3J';

// Middlewares
app.use(cors());
app.use(express.json());

// Log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Proxy para Evolution API
app.all('/api/evolution/*', async (req, res) => {
  try {
    const evolutionPath = req.path.replace('/api/evolution', '');
    const url = `${EVOLUTION_URL}${evolutionPath}`;
    
    console.log(`Proxying to: ${url}`);
    
    const config = {
      method: req.method,
      url: url,
      headers: {
        'apikey': EVOLUTION_KEY,
        'Content-Type': 'application/json',
      },
      data: req.body,
      params: req.query,
      validateStatus: () => true, // Aceitar qualquer status
    };

    const response = await axios(config);
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(500).json({
      error: 'Proxy error',
      message: error.message,
      details: error.response?.data || null
    });
  }
});

// Servir arquivos estáticos do frontend (build do Vite)
app.use(express.static(path.join(__dirname, 'dist')));

// Todas as outras rotas retornam o index.html (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Evolution API: ${EVOLUTION_URL}`);
  console.log(`🔑 Evolution Key: ${EVOLUTION_KEY.substring(0, 10)}...`);
});
