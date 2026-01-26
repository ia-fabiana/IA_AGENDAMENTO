import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, Smartphone, CheckCircle, XCircle, Loader } from 'lucide-react';
import { evolutionService } from '../services/evolutionService';

interface ConnectionStatus {
  whatsapp: 'connected' | 'disconnected' | 'connecting';
  calendar: 'connected' | 'disconnected' | 'pending';
}

export default function Connections() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    whatsapp: 'disconnected',
    calendar: 'disconnected'
  });
  const [qrCode, setQrCode] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');

  // Verificar status da conexão ao carregar
  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const status = await evolutionService.getConnectionStatus();
      setConnectionStatus(prev => ({
        ...prev,
        whatsapp: status.state === 'open' ? 'connected' : 'disconnected'
      }));
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const handleConnectWhatsApp = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      setConnectionStatus(prev => ({ ...prev, whatsapp: 'connecting' }));
      
      // Gerar QR Code
      const qr = await evolutionService.generateQRCode();
      setQrCode(qr);

      // Monitorar conexão
      const checkInterval = setInterval(async () => {
        try {
          const status = await evolutionService.getConnectionStatus();
          if (status.state === 'open') {
            setConnectionStatus(prev => ({ ...prev, whatsapp: 'connected' }));
            setQrCode('');
            setIsConnecting(false);
            clearInterval(checkInterval);
          }
        } catch (error) {
          console.error('Erro ao verificar status:', error);
        }
      }, 3000);

      // Timeout após 2 minutos
      setTimeout(() => {
        clearInterval(checkInterval);
        if (connectionStatus.whatsapp !== 'connected') {
          setIsConnecting(false);
          setError('Tempo esgotado. Tente novamente.');
        }
      }, 120000);

    } catch (error: any) {
      console.error('Erro ao conectar WhatsApp:', error);
      setError(error.message || 'Erro ao gerar QR Code');
      setConnectionStatus(prev => ({ ...prev, whatsapp: 'disconnected' }));
      setIsConnecting(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    try {
      await evolutionService.disconnect();
      setConnectionStatus(prev => ({ ...prev, whatsapp: 'disconnected' }));
      setQrCode('');
    } catch (error: any) {
      setError(error.message || 'Erro ao desconectar');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting':
        return <Loader className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'CONECTADO';
      case 'connecting':
        return 'CONECTANDO...';
      case 'pending':
        return 'AGUARDANDO';
      default:
        return 'DESCONECTADO';
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">CONEXÕES</h1>



        {/* Erro */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 mb-6">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Grid de Conexões */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* WhatsApp */}
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Conectar WhatsApp</h3>
                  <p className="text-gray-400 text-sm">Qualquer aparelho via QR Code</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.whatsapp)}
                <span className={`text-sm font-medium ${
                  connectionStatus.whatsapp === 'connected' ? 'text-green-500' :
                  connectionStatus.whatsapp === 'connecting' ? 'text-yellow-500' :
                  'text-gray-400'
                }`}>
                  {getStatusText(connectionStatus.whatsapp)}
                </span>
              </div>
            </div>

            {/* QR Code ou Botão */}
            {qrCode ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="bg-white p-4 rounded-xl mb-4">
                  <img src={qrCode} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-gray-400 text-sm text-center">
                  Escaneie o QR Code com seu WhatsApp
                </p>
                <p className="text-gray-500 text-xs text-center mt-2">
                  WhatsApp → Configurações → Aparelhos conectados → Conectar aparelho
                </p>
              </div>
            ) : connectionStatus.whatsapp === 'connected' ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-white font-medium mb-2">WhatsApp Conectado!</p>
                <p className="text-gray-400 text-sm mb-4">Seu WhatsApp está ativo e funcionando</p>
                <button
                  onClick={handleDisconnectWhatsApp}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Desconectar
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={handleConnectWhatsApp}
                  disabled={isConnecting}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      Conectar WhatsApp
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Google Calendar */}
          <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Google Calendar</h3>
                  <p className="text-gray-400 text-sm">Integração via Service Account</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.calendar)}
                <span className={`text-sm font-medium ${
                  connectionStatus.calendar === 'connected' ? 'text-green-500' :
                  connectionStatus.calendar === 'pending' ? 'text-yellow-500' :
                  'text-gray-400'
                }`}>
                  {getStatusText(connectionStatus.calendar)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#0f0f1e] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">Compartilhe sua Agenda</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      Adicione este email com permissão de edição:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-[#1a1a2e] px-3 py-2 rounded text-sm text-purple-400">
                        integracao@ia-agendamentos.iam.gserviceaccount.com
                      </code>
                      <button className="p-2 hover:bg-[#1a1a2e] rounded transition-colors">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0f0f1e] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">Cole o ID da Agenda</h4>
                    <p className="text-gray-400 text-sm mb-2">
                      Encontre em: Configurações → Configurações da agenda → ID da agenda
                    </p>
                    <input
                      type="text"
                      placeholder="ex: seuema il@gmail.com"
                      className="w-full bg-[#1a1a2e] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all">
                Verificar Conexão
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
