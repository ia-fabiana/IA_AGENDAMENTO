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
// Rota para iniciar OAuth - redireciona direto para o Google
app.get('/auth/google/calendar', (req, res) => {
  try {
    const tenantId = req.query.tenant; // Pega o tenantId do query parameter
    const authUrl = calendarService.getAuthUrl(tenantId);
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

    // Obter tenantId do state parameter (passado no fluxo OAuth)
    const tenantId = state;
    
    if (!tenantId) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Erro - Tenant Não Informado</title>
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
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Erro</h1>
            <p>Tenant ID não foi informado. Por favor, inicie o processo de autorização novamente.</p>
          </div>
          <script>
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
        </html>
      `);
    }

    // Validar formato UUID do tenantId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(tenantId)) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Erro - Tenant ID Inválido</title>
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
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Erro</h1>
            <p>Tenant ID inválido. Por favor, verifique o ID e tente novamente.</p>
          </div>
          <script>
            setTimeout(() => window.close(), 5000);
          </script>
        </body>
        </html>
      `);
    }

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

// Webhook Mercado Pago - Receber notificações de pagamento
app.post('/api/mercado-pago/webhook', async (req, res) => {
  try {
    console.log('💳 Webhook Mercado Pago recebido:', JSON.stringify(req.body, null, 2));
    
    const { action, data, type } = req.body;
    
    // Responder imediatamente para o Mercado Pago
    res.status(200).json({ received: true });
    
    // Processar apenas pagamentos aprovados
    if (action === 'payment.created' || action === 'payment.updated') {
      const paymentId = data?.id;
      
      if (!paymentId) {
        console.log('⚠️ Webhook sem ID de pagamento');
        return;
      }
      
      console.log(`💰 Processando pagamento ID: ${paymentId}`);
      
      // Importar dependências
      const { createClient } = await import('@supabase/supabase-js');
      const axios = (await import('axios')).default;
      
      const supabase = createClient(
        process.env.SUPABASE_URL || 'https://ztfnnzclwvycpbapbbhb.supabase.co',
        process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
      );
      
      // Buscar detalhes do pagamento na API do Mercado Pago
      const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;
      
      if (!MERCADO_PAGO_ACCESS_TOKEN) {
        console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado');
        return;
      }
      
      try {
        const paymentResponse = await axios.get(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`
            }
          }
        );
        
        const payment = paymentResponse.data;
        console.log(`📊 Status do pagamento: ${payment.status}`);
        
        // Processar apenas se aprovado
        if (payment.status === 'approved') {
          // Extrair informações do pagamento
          const amount = payment.transaction_amount;
          const paymentMethod = payment.payment_method_id;
          
          // Determinar quantos créditos adicionar baseado no valor
          // Mapear valores para pacotes
          const creditsPacks = {
            47: 500,    // Pack Start
            147: 2500,  // Pack Professional
            497: 10000  // Pack Enterprise
          };
          
          const creditsToAdd = creditsPacks[amount] || Math.floor(amount * 10); // 1 real = 10 créditos (fallback)
          
          // Buscar tenantId do metadata do pagamento
          const tenantId = payment.metadata?.tenant_id || 'test-tenant-id';
          
          // Verificar se já processamos este pagamento
          const { data: existingTransaction } = await supabase
            .from('transactions')
            .select('*')
            .eq('external_id', paymentId)
            .single();
          
          if (existingTransaction) {
            console.log('⚠️ Pagamento já processado anteriormente');
            return;
          }
          
          // Criar transação no banco
          const { data: transaction, error: transactionError } = await supabase
            .from('transactions')
            .insert({
              tenant_id: tenantId,
              external_id: paymentId,
              type: 'credit_purchase',
              amount: amount,
              credits_added: creditsToAdd,
              status: 'approved',
              payment_method: paymentMethod,
              metadata: payment
            })
            .select()
            .single();
          
          if (transactionError) {
            console.error('❌ Erro ao criar transação:', transactionError);
            return;
          }
          
          // Atualizar saldo de créditos do tenant
          const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .select('saldo_creditos')
            .eq('id', tenantId)
            .single();
          
          if (tenantError) {
            console.error('❌ Erro ao buscar tenant:', tenantError);
            return;
          }
          
          const newBalance = (tenant.saldo_creditos || 0) + creditsToAdd;
          
          const { error: updateError } = await supabase
            .from('tenants')
            .update({ 
              saldo_creditos: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', tenantId);
          
          if (updateError) {
            console.error('❌ Erro ao atualizar créditos:', updateError);
            return;
          }
          
          console.log(`✅ Pagamento processado com sucesso!`);
          console.log(`   Tenant: ${tenantId}`);
          console.log(`   Valor: R$ ${amount}`);
          console.log(`   Créditos adicionados: ${creditsToAdd}`);
          console.log(`   Novo saldo: ${newBalance}`);
          
          // TODO: Enviar email de confirmação ao cliente
          // TODO: Notificar o tenant via WhatsApp
        } else {
          console.log(`⏳ Pagamento em status: ${payment.status} - Aguardando aprovação`);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados do pagamento:', error.message);
      }
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook Mercado Pago:', error);
    // Não retornar erro para não quebrar o webhook
  }
});

// Admin Dashboard - Métricas globais
app.get('/api/admin/metrics', async (req, res) => {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL || 'https://ztfnnzclwvycpbapbbhb.supabase.co',
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
    );

    // Buscar total de tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*');
    
    if (tenantsError) {
      console.error('Erro ao buscar tenants:', tenantsError);
      throw tenantsError;
    }

    // Calcular métricas
    const totalTenants = tenants?.length || 0;
    
    // Calcular receita total (soma dos créditos adquiridos)
    const totalRevenue = tenants?.reduce((sum, t) => {
      // Assumindo que cada plano tem um valor (ajustar conforme necessário)
      const planValues = { 'Bronze': 29.90, 'Prata': 79.90, 'Ouro': 149.90, 'Trial': 0 };
      return sum + (planValues[t.plano] || 0);
    }, 0) || 0;

    // Calcular tokens consumidos (soma de todos os saldos)
    const totalTokensConsumed = tenants?.reduce((sum, t) => sum + (t.consumo_tokens || 0), 0) || 0;

    // Transformar tenants para o formato esperado pelo frontend
    const tenantsInfo = tenants?.map(t => ({
      id: t.id,
      name: t.nome_negocio || 'Sem nome',
      owner: t.nome_responsavel || 'Não informado',
      plan: t.plano || 'Trial',
      status: t.saldo_creditos > 0 ? 'active' : 'suspended',
      consumption: t.consumo_tokens || 0,
      lastActive: t.updated_at ? formatLastActive(new Date(t.updated_at)) : 'Nunca',
      credits: t.saldo_creditos || 0
    })) || [];

    res.json({
      globalMetrics: {
        totalTenants,
        totalRevenue,
        totalTokensConsumed,
        serverStatus: 'healthy'
      },
      tenants: tenantsInfo
    });
  } catch (error) {
    console.error('❌ Erro ao buscar métricas admin:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin metrics', 
      details: error.message 
    });
  }
});

// Função auxiliar para formatar "último acesso"
function formatLastActive(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
  return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
}

// Webhook para receber mensagens do WhatsApp (Evolution API)
app.post('/api/evolution/webhook', async (req, res) => {
  try {
    console.log('📱 Webhook recebido:', JSON.stringify(req.body, null, 2));
    
    const { event, instance, data } = req.body;
    
    // Responder imediatamente para o Evolution API
    res.status(200).json({ received: true });
    
    // Processar apenas mensagens recebidas (não enviadas por nós)
    if (event === 'messages.upsert' && data?.key?.fromMe === false) {
      const messageData = data;
      const remoteJid = messageData.key?.remoteJid;
      const messageText = messageData.message?.conversation || 
                         messageData.message?.extendedTextMessage?.text || '';
      const pushname = messageData.pushName || 'Cliente';
      
      if (!messageText || !remoteJid) {
        console.log('⚠️ Mensagem sem texto ou remetente');
        return;
      }
      
      console.log(`💬 Mensagem de ${pushname} (${remoteJid}): ${messageText}`);
      
      // Buscar ou criar tenantId baseado na instância
      // Por enquanto, usar um tenant padrão para testes
      const tenantId = 'test-tenant-id';
      
      // Importar serviços necessários
      const { evolutionService } = await import('./services/evolutionService.ts');
      const { getAIResponse, processFunctionCalls } = await import('./services/aiService.ts');
      const { createClient } = await import('@supabase/supabase-js');
      
      // Inicializar Supabase
      const supabase = createClient(
        process.env.SUPABASE_URL || 'https://ztfnnzclwvycpbapbbhb.supabase.co',
        process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
      );
      
      // Buscar configurações do tenant
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      
      // Buscar serviços do tenant
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenantId);
      
      // Buscar agendamentos existentes
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .gte('datetime', new Date().toISOString());
      
      // Configuração padrão do negócio
      const businessConfig = {
        name: tenant?.nome_negocio || 'Nosso Estabelecimento',
        address: tenant?.endereco || 'Endereço não configurado',
        promotion: {
          description: '10% de desconto na primeira visita!'
        }
      };
      
      // Obter resposta da IA
      const aiResponse = await getAIResponse(
        messageText,
        [], // histórico vazio por simplicidade
        businessConfig,
        services || [],
        appointments || [],
        pushname
      );
      
      let finalResponse = aiResponse.text;
      
      // Se houver function calls, processar
      if (aiResponse.functionCalls && aiResponse.functionCalls.length > 0) {
        const { results } = await processFunctionCalls(
          aiResponse.functionCalls,
          tenantId,
          services || [],
          appointments || []
        );
        
        // Adicionar resultados à resposta
        for (const result of results) {
          if (result.response.message) {
            finalResponse += `\n\n${result.response.message}`;
          }
          
          // Se foi agendamento bem-sucedido, adicionar detalhes
          if (result.name === 'book_appointment' && result.response.success) {
            const apt = result.response.appointment;
            const service = services?.find(s => s.id === apt.serviceId);
            finalResponse += `\n\n📅 Serviço: ${service?.name || 'N/A'}\n⏰ Horário: ${new Date(apt.datetime).toLocaleString('pt-BR')}`;
          }
        }
      }
      
      // Enviar resposta
      await evolutionService.sendMessage(instance, remoteJid, finalResponse);
      
      console.log('✅ Resposta enviada com IA');
    }
  } catch (error) {
    console.error('❌ Erro ao processar webhook:', error);
    // Não retornar erro para não quebrar o webhook
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
