
export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
}

export interface Promotion {
  enabled: boolean;
  description: string;
  imageData?: string; // base64 or URL
  callToAction: string;
}

export interface BusinessConfig {
  name: string;
  address: string;
  mapsLink: string;
  openingHours: string;
  cancellationPolicy: string;
  minAdvanceTime: number; // hours
  promotion: Promotion;
}

export interface Appointment {
  id: string;
  customerName: string;
  phoneNumber: string;
  serviceId: string;
  serviceName: string;
  date: string; // ISO string
  status: 'confirmed' | 'cancelled' | 'pending';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  image?: string;
}

export enum AppRoute {
  DASHBOARD = 'dashboard',
  TRAINING = 'training',
  CONNECTIONS = 'connections',
  APPOINTMENTS = 'appointments',
  CUSTOMERS = 'customers',
  CHAT_DEMO = 'chat_demo',
  DOCS = 'docs'
}
