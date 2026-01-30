-- Migration: Add RBAC and Google Calendar support
-- Sprint 2 enhancements

-- ============================================
-- 1. RBAC: Users, Roles and Permissions
-- ============================================

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access - can manage all tenants and system configuration'),
  ('owner', 'Tenant owner - full access to their tenant'),
  ('manager', 'Manager - can manage appointments, services, and view reports'),
  ('staff', 'Staff member - can view and manage appointments'),
  ('readonly', 'Read-only access - can only view data')
ON CONFLICT (name) DO NOTHING;

-- Users table (extends authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  resource TEXT NOT NULL, -- e.g., 'appointments', 'services', 'tenants'
  action TEXT NOT NULL, -- e.g., 'create', 'read', 'update', 'delete'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Insert default permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  ('appointments.create', 'appointments', 'create', 'Create new appointments'),
  ('appointments.read', 'appointments', 'read', 'View appointments'),
  ('appointments.update', 'appointments', 'update', 'Update appointments'),
  ('appointments.delete', 'appointments', 'delete', 'Delete appointments'),
  ('services.create', 'services', 'create', 'Create new services'),
  ('services.read', 'services', 'read', 'View services'),
  ('services.update', 'services', 'update', 'Update services'),
  ('services.delete', 'services', 'delete', 'Delete services'),
  ('tenants.read', 'tenants', 'read', 'View tenant information'),
  ('tenants.update', 'tenants', 'update', 'Update tenant settings'),
  ('tenants.delete', 'tenants', 'delete', 'Delete tenant'),
  ('users.create', 'users', 'create', 'Create new users'),
  ('users.read', 'users', 'read', 'View users'),
  ('users.update', 'users', 'update', 'Update users'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('reports.read', 'reports', 'read', 'View reports and analytics'),
  ('system.admin', 'system', 'admin', 'Full system administration access')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Admin: all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'admin'
ON CONFLICT DO NOTHING;

-- Owner: all except system admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'owner' AND p.name != 'system.admin'
ON CONFLICT DO NOTHING;

-- Manager: manage appointments, services, view reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'manager' AND p.name IN (
  'appointments.create', 'appointments.read', 'appointments.update', 'appointments.delete',
  'services.read', 'services.update',
  'reports.read'
)
ON CONFLICT DO NOTHING;

-- Staff: manage appointments only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'staff' AND p.name IN (
  'appointments.create', 'appointments.read', 'appointments.update'
)
ON CONFLICT DO NOTHING;

-- Readonly: only read permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p 
WHERE r.name = 'readonly' AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. Google Calendar Integration
-- ============================================

-- Add Google Calendar fields to tenants table
ALTER TABLE tenants 
  ADD COLUMN IF NOT EXISTS google_calendar_id TEXT,
  ADD COLUMN IF NOT EXISTS google_oauth_token TEXT, -- Encrypted OAuth token
  ADD COLUMN IF NOT EXISTS google_calendar_sync_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_last_sync TIMESTAMP WITH TIME ZONE;

-- Add Google Calendar event ID to appointments
ALTER TABLE agendamentos
  ADD COLUMN IF NOT EXISTS google_calendar_event_id TEXT,
  ADD COLUMN IF NOT EXISTS google_calendar_synced BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS google_calendar_sync_error TEXT;

-- ============================================
-- 3. Activity Logs for Audit Trail
-- ============================================

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- e.g., 'appointment.created', 'user.login'
  resource_type TEXT, -- e.g., 'appointment', 'service'
  resource_id UUID,
  details JSONB, -- Additional context
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Index for appointments table
CREATE INDEX IF NOT EXISTS idx_agendamentos_tenant_date ON agendamentos(tenant_id, data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Create a default admin user for the fixed tenant
INSERT INTO users (email, name, tenant_id, role_id)
SELECT 
  'admin@estudoshine.com',
  'Administrador',
  '550e8400-e29b-41d4-a716-446655440000',
  (SELECT id FROM roles WHERE name = 'admin')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@estudoshine.com');

-- ============================================
-- 4. Update existing data
-- ============================================

-- Enable Google Calendar sync for the demo tenant (will need manual OAuth setup)
UPDATE tenants 
SET google_calendar_sync_enabled = false
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
