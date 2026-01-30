import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock environment variables for testing
beforeAll(() => {
  process.env.ENCRYPTION_KEY = 'test-encryption-key-minimum-32-characters-long-for-security';
  process.env.GOOGLE_CLIENT_ID = 'test-client-id';
  process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
  process.env.GOOGLE_REDIRECT_URI = 'http://localhost:5173/oauth2callback';
  process.env.SUPABASE_URL = 'https://test.supabase.co';
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  process.env.GEMINI_API_KEY = 'test-gemini-api-key';
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent';
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
