import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFeatureFlags,
  isFeatureEnabled,
  enableFeatureForTenant,
  disableFeatureForTenant,
  getAllFlags,
} from '../../server/featureFlags';

describe('Feature Flags', () => {
  describe('getFeatureFlags', () => {
    it('should return default flags when no tenant specified', () => {
      const flags = getFeatureFlags();
      
      expect(flags).toHaveProperty('googleCalendarSync');
      expect(flags).toHaveProperty('aiScheduling');
      expect(flags).toHaveProperty('whatsappIntegration');
      expect(flags).toHaveProperty('advancedAnalytics');
      expect(flags).toHaveProperty('multiTenancy');
      expect(flags).toHaveProperty('rbacEnabled');
    });

    it('should return default values for all flags', () => {
      const flags = getFeatureFlags();
      
      expect(flags.googleCalendarSync).toBe(true);
      expect(flags.aiScheduling).toBe(true);
      expect(flags.whatsappIntegration).toBe(true);
      expect(flags.advancedAnalytics).toBe(true);
      expect(flags.multiTenancy).toBe(true);
      expect(flags.rbacEnabled).toBe(true);
    });

    it('should return default flags for unknown tenant', () => {
      const flags = getFeatureFlags('unknown-tenant-id');
      
      expect(flags.googleCalendarSync).toBe(true);
      expect(flags.aiScheduling).toBe(true);
    });

    it('should apply tenant-specific overrides', () => {
      const tenantId = 'test-tenant-123';
      enableFeatureForTenant(tenantId, 'advancedAnalytics');
      
      const flags = getFeatureFlags(tenantId);
      expect(flags.advancedAnalytics).toBe(true);
    });
  });

  describe('isFeatureEnabled', () => {
    it('should check if feature is enabled globally', () => {
      expect(isFeatureEnabled('googleCalendarSync')).toBe(true);
      expect(isFeatureEnabled('aiScheduling')).toBe(true);
    });

    it('should check if feature is enabled for tenant', () => {
      const tenantId = 'test-tenant-456';
      
      expect(isFeatureEnabled('googleCalendarSync', tenantId)).toBe(true);
    });

    it('should respect tenant overrides', () => {
      const tenantId = 'test-tenant-789';
      disableFeatureForTenant(tenantId, 'aiScheduling');
      
      expect(isFeatureEnabled('aiScheduling', tenantId)).toBe(false);
    });
  });

  describe('enableFeatureForTenant', () => {
    it('should enable a feature for specific tenant', () => {
      const tenantId = 'enable-test-tenant';
      
      enableFeatureForTenant(tenantId, 'advancedAnalytics');
      
      expect(isFeatureEnabled('advancedAnalytics', tenantId)).toBe(true);
    });

    it('should not affect other tenants', () => {
      const tenantId1 = 'tenant-1';
      const tenantId2 = 'tenant-2';
      
      enableFeatureForTenant(tenantId1, 'advancedAnalytics');
      
      expect(isFeatureEnabled('advancedAnalytics', tenantId1)).toBe(true);
      expect(isFeatureEnabled('advancedAnalytics', tenantId2)).toBe(true); // Still default
    });

    it('should create override for new tenant', () => {
      const tenantId = 'new-tenant-override';
      
      enableFeatureForTenant(tenantId, 'whatsappIntegration');
      
      const allFlags = getAllFlags();
      expect(allFlags.overrides).toHaveProperty(tenantId);
      expect(allFlags.overrides[tenantId].whatsappIntegration).toBe(true);
    });
  });

  describe('disableFeatureForTenant', () => {
    it('should disable a feature for specific tenant', () => {
      const tenantId = 'disable-test-tenant';
      
      disableFeatureForTenant(tenantId, 'googleCalendarSync');
      
      expect(isFeatureEnabled('googleCalendarSync', tenantId)).toBe(false);
    });

    it('should override default enabled features', () => {
      const tenantId = 'override-tenant';
      
      // Default is true
      expect(isFeatureEnabled('multiTenancy', tenantId)).toBe(true);
      
      // Disable for this tenant
      disableFeatureForTenant(tenantId, 'multiTenancy');
      
      expect(isFeatureEnabled('multiTenancy', tenantId)).toBe(false);
    });

    it('should not affect default flags', () => {
      const tenantId = 'temp-tenant';
      
      disableFeatureForTenant(tenantId, 'rbacEnabled');
      
      // Default should still be true
      const defaultFlags = getFeatureFlags();
      expect(defaultFlags.rbacEnabled).toBe(true);
    });
  });

  describe('getAllFlags', () => {
    it('should return defaults and overrides', () => {
      const allFlags = getAllFlags();
      
      expect(allFlags).toHaveProperty('defaults');
      expect(allFlags).toHaveProperty('overrides');
    });

    it('should include all default flags', () => {
      const allFlags = getAllFlags();
      
      expect(allFlags.defaults).toHaveProperty('googleCalendarSync');
      expect(allFlags.defaults).toHaveProperty('aiScheduling');
      expect(allFlags.defaults).toHaveProperty('whatsappIntegration');
      expect(allFlags.defaults).toHaveProperty('advancedAnalytics');
      expect(allFlags.defaults).toHaveProperty('multiTenancy');
      expect(allFlags.defaults).toHaveProperty('rbacEnabled');
    });

    it('should include tenant overrides', () => {
      const tenantId = 'tracked-tenant';
      enableFeatureForTenant(tenantId, 'advancedAnalytics');
      
      const allFlags = getAllFlags();
      
      expect(allFlags.overrides).toHaveProperty(tenantId);
    });
  });

  describe('Feature Flag Use Cases', () => {
    it('should support gradual rollout to beta testers', () => {
      const betaTenant = 'beta-tester-1';
      const regularTenant = 'regular-user-1';
      
      // Enable advanced features for beta tester
      enableFeatureForTenant(betaTenant, 'advancedAnalytics');
      
      expect(isFeatureEnabled('advancedAnalytics', betaTenant)).toBe(true);
      expect(isFeatureEnabled('advancedAnalytics', regularTenant)).toBe(true); // Default
    });

    it('should support disabling problematic features', () => {
      const affectedTenant = 'problematic-tenant';
      
      // Disable feature that's causing issues
      disableFeatureForTenant(affectedTenant, 'whatsappIntegration');
      
      expect(isFeatureEnabled('whatsappIntegration', affectedTenant)).toBe(false);
    });

    it('should support A/B testing scenarios', () => {
      const groupA = 'tenant-group-a';
      const groupB = 'tenant-group-b';
      
      // Group A has new feature
      enableFeatureForTenant(groupA, 'advancedAnalytics');
      
      // Group B doesn't
      disableFeatureForTenant(groupB, 'advancedAnalytics');
      
      expect(isFeatureEnabled('advancedAnalytics', groupA)).toBe(true);
      expect(isFeatureEnabled('advancedAnalytics', groupB)).toBe(false);
    });
  });
});
