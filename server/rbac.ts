import { supabase } from '../services/supabase';
import { logger } from './logger';

/**
 * Role-Based Access Control (RBAC) Service
 * Handles permissions checking and user role management
 */

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

/**
 * Get user with role and permissions
 */
export const getUserWithPermissions = async (userId: string): Promise<User | null> => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        tenant_id,
        role_id,
        is_active,
        roles:role_id (
          id,
          name,
          role_permissions (
            permissions:permission_id (
              name
            )
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      logger.warn({ userId, error: userError }, 'User not found');
      return null;
    }

    // Extract permissions
    const role = userData.roles as any;
    const permissions = role.role_permissions
      .map((rp: any) => rp.permissions.name)
      .filter(Boolean);

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      tenantId: userData.tenant_id,
      roleId: userData.role_id,
      roleName: role.name,
      isActive: userData.is_active,
      permissions
    };
  } catch (error) {
    logger.error({ error, userId }, 'Failed to get user with permissions');
    return null;
  }
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = async (
  userId: string,
  permissionName: string
): Promise<boolean> => {
  try {
    const user = await getUserWithPermissions(userId);
    
    if (!user || !user.isActive) {
      return false;
    }

    // Admin has all permissions
    if (user.roleName === 'admin') {
      return true;
    }

    return user.permissions.includes(permissionName);
  } catch (error) {
    logger.error({ error, userId, permissionName }, 'Failed to check permission');
    return false;
  }
};

/**
 * Check if user has permission for a resource action
 */
export const canAccess = async (
  userId: string,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): Promise<boolean> => {
  const permissionName = `${resource}.${action}`;
  return hasPermission(userId, permissionName);
};

/**
 * Verify user belongs to tenant (for tenant isolation)
 */
export const verifyTenantAccess = async (
  userId: string,
  tenantId: string
): Promise<boolean> => {
  try {
    const user = await getUserWithPermissions(userId);
    
    if (!user || !user.isActive) {
      return false;
    }

    // Admin can access all tenants
    if (user.roleName === 'admin') {
      return true;
    }

    return user.tenantId === tenantId;
  } catch (error) {
    logger.error({ error, userId, tenantId }, 'Failed to verify tenant access');
    return false;
  }
};

/**
 * Get all roles
 */
export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name, description')
      .order('name');

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error({ error }, 'Failed to get roles');
    return [];
  }
};

/**
 * Get permissions for a role
 */
export const getRolePermissions = async (roleId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        permissions:permission_id (
          name
        )
      `)
      .eq('role_id', roleId);

    if (error) throw error;

    return data?.map((rp: any) => rp.permissions.name) || [];
  } catch (error) {
    logger.error({ error, roleId }, 'Failed to get role permissions');
    return [];
  }
};

/**
 * Create a new user
 */
export const createUser = async (
  email: string,
  name: string,
  tenantId: string,
  roleId: string,
  createdByUserId: string
): Promise<User | null> => {
  try {
    // Check if creator has permission
    const canCreate = await hasPermission(createdByUserId, 'users.create');
    if (!canCreate) {
      logger.warn({ createdByUserId }, 'User does not have permission to create users');
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        name,
        tenant_id: tenantId,
        role_id: roleId,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    logger.info({ userId: data.id, email }, 'User created successfully');

    // Log activity
    await logActivity(
      tenantId,
      createdByUserId,
      'user.created',
      'user',
      data.id,
      { email, name }
    );

    return getUserWithPermissions(data.id);
  } catch (error) {
    logger.error({ error, email }, 'Failed to create user');
    return null;
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (
  userId: string,
  newRoleId: string,
  updatedByUserId: string
): Promise<boolean> => {
  try {
    // Check if updater has permission
    const canUpdate = await hasPermission(updatedByUserId, 'users.update');
    if (!canUpdate) {
      logger.warn({ updatedByUserId }, 'User does not have permission to update users');
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({ role_id: newRoleId, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    logger.info({ userId, newRoleId }, 'User role updated successfully');

    return true;
  } catch (error) {
    logger.error({ error, userId }, 'Failed to update user role');
    return false;
  }
};

/**
 * Deactivate user
 */
export const deactivateUser = async (
  userId: string,
  deactivatedByUserId: string
): Promise<boolean> => {
  try {
    // Check if deactivator has permission
    const canDelete = await hasPermission(deactivatedByUserId, 'users.delete');
    if (!canDelete) {
      logger.warn({ deactivatedByUserId }, 'User does not have permission to deactivate users');
      return false;
    }

    const { error } = await supabase
      .from('users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) throw error;

    logger.info({ userId }, 'User deactivated successfully');

    return true;
  } catch (error) {
    logger.error({ error, userId }, 'Failed to deactivate user');
    return false;
  }
};

/**
 * Log activity for audit trail
 */
export const logActivity = async (
  tenantId: string,
  userId: string | null,
  action: string,
  resourceType?: string,
  resourceId?: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    await supabase.from('activity_logs').insert({
      tenant_id: tenantId,
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    // Don't throw - logging failures shouldn't break the app
    logger.error({ error, action }, 'Failed to log activity');
  }
};

/**
 * Get activity logs for a tenant
 */
export const getActivityLogs = async (
  tenantId: string,
  limit: number = 100,
  offset: number = 0
): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        users:user_id (
          name,
          email
        )
      `)
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error({ error, tenantId }, 'Failed to get activity logs');
    return [];
  }
};
