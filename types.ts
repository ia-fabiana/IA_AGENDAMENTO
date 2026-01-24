
export interface Service {
  id: string;
  tenantId: string;
  name: string;
  price: number;
  duration: number; // minutes
}

export type AIProvider = 'gemini' | 'openai';

export interface AIConfig {
  id: string;
  tenantId: string;
  provider: AIProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  name: string;
  behavior: string;
  openaiKey?: string;
  useMasterKey: boolean;
  botActive: boolean; // Novo: Controle de ativação do bot
}

export interface Tenant {
  id: string;
  nome_salao: string;
  owner_id: string;
  status_assinatura: 'active' | 'suspended' | 'trial';
  saldo_creditos: number;
}

export interface Instance {
  id: string;
  tenant_id: string;
  instance_name: string;
  evolution_token: string;
  status_conexao: 'connected' | 'disconnected' | 'connecting';
  whatsapp_number?: string;
}

export interface ChatLog {
  id: string;
  instance_id: string;
  phone_number: string;
  message_in: string;
  message_out: string;
  tokens_used: number;
  timestamp: Date;
}

export interface UserCredits {
  balance: number;
  totalLimit: number;
  planName: 'Bronze' | 'Prata' | 'Ouro' | 'Grátis';
  usageThisMonth: number;
  tokensTotal?: number;
}

export interface BusinessConfig {
  id: string;
  name: string;
  address: string;
  mapsLink: string;
  openingHours: string;
  cancellationPolicy: string;
  minAdvanceTime: number;
  promotion: {
    enabled: boolean;
    description: string;
    imageData?: string;
    callToAction: string;
  };
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerName: string;
  phoneNumber: string;
  serviceId: string;
  serviceName: string;
  date: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  value: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  image?: string;
  tokensConsumed?: number;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  AGENTS = 'agents',
  APPOINTMENTS = 'appointments',
  TRAINING = 'training',
  CONNECTIONS = 'connections',
  CHAT_DEMO = 'chat_demo',
  PLAN_AND_CREDITS = 'plan_and_credits',
  ADMIN = 'admin',
  DOCS = 'docs'
}

export interface TenantInfo {
  id: string;
  name: string;
  owner: string;
  plan: string;
  status: 'active' | 'suspended' | 'trial';
  consumption: number;
  lastActive: string;
}

export interface GlobalAdminMetrics {
  totalTenants: number;
  totalRevenue: number;
  totalTokensConsumed: number;
  serverStatus: 'healthy' | 'warning' | 'down';
}

// Fixed missing export for DashboardMetrics
export interface DashboardMetrics {
  totalRevenue: number;
  conversionRate: number;
  occupancyRate: number;
  activeAppointments: number;
}
