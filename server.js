import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import { calendarService } from './services/calendarService.js';

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

// Google Calendar OAuth2 Routes
app.get('/auth/google/calendar', (req, res) => {
  try {
    const authUrl = calendarService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).send('No authorization code received');
    }

    // Troca o código por tokens
    const tokens = await calendarService.getTokensFromCode(code);
    
    // Aqui você deve salvar os tokens no Supabase associados ao tenant
    // Por enquanto, vamos apenas retornar sucesso e fechar a janela
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Autorização Concluída</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .success-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
          }
          p {
            margin: 0;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Google Calendar Conectado!</h1>
          <p>Você pode fechar esta janela.</p>
        </div>
        <script>
          // Envia mensagem para a janela pai e fecha
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_CALENDAR_CONNECTED', tokens: ${JSON.stringify(tokens)} }, '*');
            setTimeout(() => window.close(), 2000);
          }
        </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in Google callback:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Erro na Autorização</title>
        <style>
          body {
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
          }
          .container {
            text-align: center;
            padding: 40px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            backdrop-filter: blur(10px);
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            margin: 0 0 10px 0;
            font-size: 32px;
          }
          p {
            margin: 0;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h1>Erro na Conexão</h1>
          <p>Tente novamente mais tarde.</p>
        </div>
        <script>
          setTimeout(() => window.close(), 3000);
        </script>
      </body>
      </html>
    `);
  }
});

// API para listar eventos do calendário
app.post('/api/calendar/events', async (req, res) => {
  try {
    const { tokens } = req.body;
    
    if (!tokens) {
      return res.status(400).json({ error: 'Tokens required' });
    }

    const events = await calendarService.listEvents(tokens);
    res.json({ events });
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Failed to list events' });
  }
});

// API de teste para criar evento usando tokens salvos em memória
app.post('/api/calendar/test/create-event', async (req, res) => {
  try {
    const tokens = calendarService.getLastTokens();
    
    if (!tokens) {
      return res.status(400).json({ 
        error: 'No tokens found. Please authorize first at /auth/google/calendar' 
      });
    }

    // Evento de teste
    const event = {
      summary: '🎉 Teste de Integração Google Calendar',
      description: 'Este é um evento de teste criado pela IA.AGENDAMENTOS para validar a integração com o Google Calendar.',
      start: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Amanhã
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(), // Amanhã + 1h
        timeZone: 'America/Sao_Paulo',
      },
    };

    const createdEvent = await calendarService.createEvent(tokens, event);
    
    res.json({ 
      success: true,
      message: 'Evento criado com sucesso!',
      event: createdEvent,
      eventLink: createdEvent.htmlLink
    });
  } catch (error) {
    console.error('Error creating test event:', error);
    res.status(500).json({ 
      error: 'Failed to create test event',
      details: error.message 
    });
  }
});

// API para criar evento
app.post('/api/calendar/events/create', async (req, res) => {
  try {
    const { tokens, event } = req.body;
    
    if (!tokens || !event) {
      return res.status(400).json({ error: 'Tokens and event required' });
    }

    const createdEvent = await calendarService.createEvent(tokens, event);
    res.json({ event: createdEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
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
// IMPORTANTE: Isso deve vir DEPOIS de todas as rotas da API
app.use(express.static(path.join(__dirname, 'dist')));

// Todas as outras rotas retornam o index.html (SPA)
// Esta rota catch-all deve ser a ÚLTIMA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Evolution API: ${EVOLUTION_URL}`);
  console.log(`🔑 Evolution Key: ${EVOLUTION_KEY.substring(0, 10)}...`);
});
