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
// SECURITY NOTE: These default values are for development only
// In production, always use environment variables configured in Cloud Run
const EVOLUTION_URL = process.env.EVOLUTION_URL || 'https://api.iafabiana.com.br';
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
// Rota para iniciar OAuth - redireciona direto para o Google
app.get('/auth/google/calendar', (req, res) => {
  try {
    // Obter tenantId da query string ou do header (obrigatório)
    const tenantId = req.query.tenantId || req.headers['x-tenant-id'];
    
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'tenantId is required',
        message: 'Please provide tenantId as query parameter or x-tenant-id header'
      });
    }
    
    // Passar o tenantId como state para recuperar no callback
    const authUrl = calendarService.getAuthUrl(tenantId);
    
    console.log(`Iniciando OAuth para tenant: ${tenantId}`);
    
    // Redireciona direto para a página de autorização do Google
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).send('Failed to generate auth URL');
  }
});

app.get('/api/calendar/callback', async (req, res) => {
  try {
    const { code, error, state } = req.query;
    
    // Verificar se houve erro na autorização
    if (error) {
      console.error('❌ Erro na autorização OAuth:', error);
      return res.status(400).send(`
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
            <h1>Acesso Negado</h1>
            <p>Você negou o acesso ao Google Calendar.</p>
          </div>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
        </html>
      `);
    }
    
    if (!code) {
      return res.status(400).send('No authorization code received');
    }

    // Obter tenantId do state (passado na URL de autenticação)
    if (!state) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Erro - TenantId Ausente</title>
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
              border-radius: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Erro de Autenticação</h1>
            <p>TenantId não foi fornecido. Por favor, inicie o processo novamente.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    const tenantId = state;
    console.log(`Processando callback OAuth para tenant: ${tenantId}`);

    // Troca o código por tokens e salva no Supabase
    const { tokens, googleEmail } = await calendarService.getTokensFromCode(code, tenantId);
    
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
            window.opener.postMessage({ 
              type: 'GOOGLE_CALENDAR_CONNECTED', 
              tenantId: '${tenantId}',
              googleEmail: '${googleEmail}'
            }, '*');
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
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    const events = await calendarService.listEvents(tenantId);
    res.json({ events });
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Failed to list events', details: error.message });
  }
});

// API de teste para criar evento usando tenantId
app.post('/api/calendar/test/create-event', async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    // Usar tenantId do body ou padrão para testes
    const targetTenantId = tenantId || 'test-tenant-id';
    
    // Verificar se o tenant tem tokens salvos
    const isConnected = await calendarService.isConnected(targetTenantId);
    if (!isConnected) {
      return res.status(400).json({ 
        error: 'Google Calendar not connected. Please authorize first at /auth/google/calendar',
        tenantId: targetTenantId
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

    const createdEvent = await calendarService.createEvent(targetTenantId, event);
    
    res.json({ 
      success: true,
      message: 'Evento criado com sucesso!',
      event: createdEvent,
      eventLink: createdEvent.htmlLink,
      tenantId: targetTenantId
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
    const { tenantId, event } = req.body;
    
    if (!tenantId || !event) {
      return res.status(400).json({ error: 'tenantId and event required' });
    }

    const createdEvent = await calendarService.createEvent(tenantId, event);
    res.json({ event: createdEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

// API para verificar status da conexão do Google Calendar
app.get('/api/calendar/status/:tenantId', async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const isConnected = await calendarService.isConnected(tenantId);
    const isValid = isConnected ? await calendarService.verifyTokens(tenantId) : false;
    
    res.json({ 
      connected: isConnected,
      valid: isValid,
      tenantId 
    });
  } catch (error) {
    console.error('Error checking calendar status:', error);
    res.status(500).json({ error: 'Failed to check status', details: error.message });
  }
});

// API para desconectar Google Calendar
app.post('/api/calendar/disconnect', async (req, res) => {
  try {
    const { tenantId } = req.body;
    
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId required' });
    }

    await calendarService.disconnect(tenantId);
    res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error) {
    console.error('Error disconnecting calendar:', error);
    res.status(500).json({ error: 'Failed to disconnect', details: error.message });
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
