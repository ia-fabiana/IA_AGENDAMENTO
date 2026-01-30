
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
  botActive: boolean; 
}

export interface DeploymentLog {
  id: string;
  step: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  timestamp: string;
}

export interface GitHubSyncInfo {
  repo: string;
  branch: string;
  lastCommit: string;
  status: 'synced' | 'outdated' | 'error';
  lastBuildId?: string;
}

export interface Tenant {
  id: string;
  nome_salao: string;
  owner_id: string;
  status_assinatura: 'active' | 'suspended';
  saldo_creditos: number;
  googleCalendarId?: string;
  googleOAuthToken?: string;
  googleCalendarSyncEnabled?: boolean;
}

export interface Instance {
  id: string;
  tenant_id: string;
  instance_name: string;
  evolution_token: string;
  status_conexao: 'connected' | 'disconnected' | 'connecting';
  whatsapp_number?: string;
}

export interface UserCredits {
  balance: number;
  totalLimit: number;
  planName: 'Bronze' | 'Prata' | 'Ouro' | 'Empresarial';
  usageThisMonth: number;
  tokensTotal?: number;
}

export interface BusinessConfig {
  id: string;
  name: string;
  phoneNumber: string; 
  address: string;
  mapsLink: string;
  openingHours: string;
  cancellationPolicy: string;
  minAdvanceTime: number;
  googleCalendarId?: string;
  googleCalendarSyncEnabled?: boolean;
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
  googleCalendarEventId?: string;
  googleCalendarSynced?: boolean;
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
  CHAT_MONITOR = 'chat_monitor',
  PLAN_AND_CREDITS = 'plan_and_credits',
  ADMIN = 'admin',
  DOCS = 'docs'
}

export interface TenantInfo {
  id: string;
  name: string;
  owner: string;
  plan: string;
  status: 'active' | 'suspended';
  consumption: number;
  lastActive: string;
}

export interface GlobalAdminMetrics {
  totalTenants: number;
  totalRevenue: number;
  totalTokensConsumed: number;
  serverStatus: 'healthy' | 'warning' | 'down';
  githubSync: GitHubSyncInfo;
}

// RBAC Types
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roleId: string;
  roleName: string;
  isActive: boolean;
  permissions: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}


export interface DashboardMetrics {
  totalRevenue: number;
  conversionRate: number;
  occupancyRate: number;
  activeAppointments: number;
}
