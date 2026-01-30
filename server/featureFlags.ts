/**
 * Feature flags system for controlled rollout
 * Sprint 4 - Production: Feature flags for testing with real clients
 * 
 * NOTE: This implementation uses in-memory storage which is reset on server restart.
 * For production use, consider:
 * - Storing overrides in database (Supabase)
 * - Using environment variables for defaults
 * - External feature flag service (LaunchDarkly, etc.)
 */

export interface FeatureFlags {
  googleCalendarSync: boolean;
  aiScheduling: boolean;
  whatsappIntegration: boolean;
  advancedAnalytics: boolean;
  multiTenancy: boolean;
  rbacEnabled: boolean;
}

// Default feature flags
const defaultFlags: FeatureFlags = {
  googleCalendarSync: true,
  aiScheduling: true,
  whatsappIntegration: true,
  advancedAnalytics: true,
  multiTenancy: true,
  rbacEnabled: true,
};

// Tenant-specific overrides (for gradual rollout)
const tenantOverrides: Record<string, Partial<FeatureFlags>> = {
  // Example: Enable beta features for specific tenants
  // 'tenant-uuid-1': { advancedAnalytics: true },
  // 'tenant-uuid-2': { aiScheduling: false },
};

/**
 * Get feature flags for a tenant
 */
export function getFeatureFlags(tenantId?: string): FeatureFlags {
  if (!tenantId) {
    return defaultFlags;
  }

  const overrides = tenantOverrides[tenantId] || {};
  return {
    ...defaultFlags,
    ...overrides,
  };
}

/**
 * Check if a specific feature is enabled for a tenant
 */
export function isFeatureEnabled(
  feature: keyof FeatureFlags,
  tenantId?: string
): boolean {
  const flags = getFeatureFlags(tenantId);
  return flags[feature];
}

/**
 * Enable a feature for a specific tenant
 */
export function enableFeatureForTenant(
  tenantId: string,
  feature: keyof FeatureFlags
): void {
  if (!tenantOverrides[tenantId]) {
    tenantOverrides[tenantId] = {};
  }
  tenantOverrides[tenantId][feature] = true;
}

/**
 * Disable a feature for a specific tenant
 */
export function disableFeatureForTenant(
  tenantId: string,
  feature: keyof FeatureFlags
): void {
  if (!tenantOverrides[tenantId]) {
    tenantOverrides[tenantId] = {};
  }
  tenantOverrides[tenantId][feature] = false;
}

/**
 * Get all feature flags as an object (for debugging/admin)
 */
export function getAllFlags(): {
  defaults: FeatureFlags;
  overrides: Record<string, Partial<FeatureFlags>>;
} {
  return {
    defaults: defaultFlags,
    overrides: tenantOverrides,
  };
}
