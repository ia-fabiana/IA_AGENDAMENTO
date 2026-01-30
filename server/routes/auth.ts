import express from 'express';
import { getUserWithPermissions, createUser, getRoles, canAccess, logActivity } from '../rbac';
import { logger } from '../logger';

const router = express.Router();

// Get user with permissions
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserWithPermissions(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get user');
    res.status(500).json({ error: error.message });
  }
});

// Check permission
router.post('/check-permission', async (req, res) => {
  try {
    const { userId, permission } = req.body;

    const hasPermission = await canAccess(
      userId,
      permission.resource,
      permission.action
    );

    res.json({ hasPermission });
  } catch (error: any) {
    logger.error({ error }, 'Failed to check permission');
    res.status(500).json({ error: error.message });
  }
});

// Get all roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await getRoles();
    res.json({ roles });
  } catch (error: any) {
    logger.error({ error }, 'Failed to get roles');
    res.status(500).json({ error: error.message });
  }
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const { email, name, tenantId, roleId, createdByUserId } = req.body;

    const user = await createUser(email, name, tenantId, roleId, createdByUserId);

    if (!user) {
      return res.status(403).json({ error: 'Permission denied or user creation failed' });
    }

    res.status(201).json({ user });
  } catch (error: any) {
    logger.error({ error }, 'Failed to create user');
    res.status(500).json({ error: error.message });
  }
});

// Log user login
router.post('/login', async (req, res) => {
  try {
    const { userId, tenantId, ipAddress, userAgent } = req.body;

    await logActivity(
      tenantId,
      userId,
      'user.login',
      'user',
      userId,
      { loginTime: new Date().toISOString() },
      ipAddress,
      userAgent
    );

    res.json({ success: true });
  } catch (error: any) {
    logger.error({ error }, 'Failed to log login');
    res.status(500).json({ error: error.message });
  }
});

export default router;
