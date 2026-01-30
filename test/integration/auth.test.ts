import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRouter from '../../server/routes/auth';
import { getUserWithPermissions, canAccess, getRoles, createUser } from '../../server/rbac';

// Mock dependencies
vi.mock('../../server/rbac', () => ({
  getUserWithPermissions: vi.fn(),
  canAccess: vi.fn(),
  getRoles: vi.fn(),
  createUser: vi.fn(),
  logActivity: vi.fn(),
}));

describe('Auth API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRouter);
  });

  describe('GET /api/auth/user/:userId', () => {
    it('should return 404 if user not found', async () => {
      vi.mocked(getUserWithPermissions).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/auth/user/user-1');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return user with permissions', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        tenantId: 'tenant-1',
        roleId: 'role-1',
        roleName: 'manager',
        isActive: true,
        permissions: ['appointments.create', 'appointments.read']
      };

      vi.mocked(getUserWithPermissions).mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/auth/user/user-1');

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual(mockUser);
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('POST /api/auth/check-permission', () => {
    it('should check permission successfully', async () => {
      vi.mocked(canAccess).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/check-permission')
        .send({
          userId: 'user-1',
          permission: {
            resource: 'appointments',
            action: 'create'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.hasPermission).toBe(true);
    });

    it('should return false for missing permission', async () => {
      vi.mocked(canAccess).mockResolvedValue(false);

      const response = await request(app)
        .post('/api/auth/check-permission')
        .send({
          userId: 'user-1',
          permission: {
            resource: 'users',
            action: 'delete'
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.hasPermission).toBe(false);
    });
  });

  describe('GET /api/auth/roles', () => {
    it('should return all roles', async () => {
      const mockRoles = [
        { id: 'role-1', name: 'admin', description: 'Administrator' },
        { id: 'role-2', name: 'manager', description: 'Manager' },
        { id: 'role-3', name: 'staff', description: 'Staff member' }
      ];

      vi.mocked(getRoles).mockResolvedValue(mockRoles);

      const response = await request(app)
        .get('/api/auth/roles');

      expect(response.status).toBe(200);
      expect(response.body.roles).toHaveLength(3);
      expect(response.body.roles[0].name).toBe('admin');
    });

    it('should handle empty roles list', async () => {
      vi.mocked(getRoles).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/auth/roles');

      expect(response.status).toBe(200);
      expect(response.body.roles).toHaveLength(0);
    });
  });

  describe('POST /api/auth/users', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        id: 'new-user-1',
        email: 'newuser@example.com',
        name: 'New User',
        tenantId: 'tenant-1',
        roleId: 'role-2',
        roleName: 'staff',
        isActive: true,
        permissions: ['appointments.read']
      };

      vi.mocked(createUser).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/auth/users')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          tenantId: 'tenant-1',
          roleId: 'role-2',
          createdByUserId: 'admin-1'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toEqual(mockUser);
      expect(response.body.user.email).toBe('newuser@example.com');
    });

    it('should return 403 if user creation fails', async () => {
      vi.mocked(createUser).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/users')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          tenantId: 'tenant-1',
          roleId: 'role-2',
          createdByUserId: 'user-1'
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Permission denied or user creation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should log login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          userId: 'user-1',
          tenantId: 'tenant-1',
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
