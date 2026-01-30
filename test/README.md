# Test Directory

This directory contains all automated tests for the IA_AGENDAMENTO system.

## Directory Structure

```
test/
├── setup.ts                    # Global test setup and configuration
├── unit/                       # Unit tests (isolated component testing)
│   ├── encryption.test.ts      # Encryption service tests (10 tests)
│   └── logger.test.ts          # Logger service tests (13 tests)
├── integration/                # Integration tests (API endpoint testing)
│   ├── appointments.test.ts    # Appointments API tests (9 tests)
│   ├── auth.test.ts            # Authentication API tests (9 tests)
│   ├── calendar.test.ts        # Calendar API tests (11 tests)
│   └── server.test.ts          # Server health tests (4 tests)
└── helpers/                    # Test helper utilities (future)
```

## Test Statistics

- **Total Test Files:** 6
- **Total Tests:** 56
- **Success Rate:** 100%
- **Code Coverage:** 77.87%
- **Average Test Duration:** ~2.5 seconds

## Running Tests

### Run all tests (watch mode)
```bash
npm test
```

### Run tests once
```bash
npm run test:run
```

### Run with UI
```bash
npm run test:ui
```
Opens interactive UI at http://localhost:51204

### Generate coverage report
```bash
npm run test:coverage
```
HTML report available at `coverage/index.html`

## Test Categories

### Unit Tests (23 tests)

Testing isolated components and services:

- **Encryption Service** (10 tests)
  - Basic encryption/decryption
  - Random salt and IV generation
  - Special characters and Unicode support
  - Error handling and tamper detection
  - OAuth token encryption

- **Logger Service** (13 tests)
  - Logger instance creation
  - Info, error, warn, debug logging
  - Child logger creation
  - Specialized logging helpers
  - Error logging with context

### Integration Tests (33 tests)

Testing API endpoints and their interactions:

- **Appointments API** (9 tests)
  - Create appointment
  - List appointments
  - Delete appointment
  - Permission checks
  - Google Calendar sync

- **Calendar API** (11 tests)
  - OAuth authorization URL
  - OAuth callback processing
  - Availability checking
  - Calendar disconnect
  - Input validation

- **Auth API** (9 tests)
  - User retrieval
  - Permission checking
  - Role management
  - User creation
  - Login logging

- **Server Health** (4 tests)
  - Health check endpoint
  - Timestamp validation
  - Uptime reporting
  - 404 handling

## Testing Patterns

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

### Integration Test Example
```typescript
import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

describe('API Endpoint', () => {
  it('should return success', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expectedData);
  });
});
```

## Mocking Strategy

Tests use Vitest's built-in mocking capabilities:

```typescript
// Mock external modules
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock functions
const mockFn = vi.fn().mockResolvedValue({ success: true });

// Verify calls
expect(mockFn).toHaveBeenCalledWith(expectedArgs);
```

## Coverage Goals

Current coverage by module:

| Module | Coverage | Goal |
|--------|----------|------|
| server/encryption.ts | 89.36% | ✅ |
| server/logger.ts | 100% | ✅ |
| server/routes/appointments.ts | 66.66% | 🔄 70% |
| server/routes/auth.ts | 74.35% | ✅ |
| server/routes/calendar.ts | 87.23% | ✅ |

**Overall: 77.87%** (Target: 80%)

## Environment Variables

Tests use mocked environment variables set in `setup.ts`:

```typescript
process.env.ENCRYPTION_KEY = 'test-encryption-key-minimum-32-characters-long-for-security';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
```

## Continuous Integration

Tests are designed to run in CI/CD pipelines:

- Fast execution (~2.5s)
- No external dependencies
- Deterministic results
- Clean setup/teardown

## Future Improvements

1. **Increase Coverage**
   - Add RBAC service direct tests
   - Add Google Calendar service tests
   - Add AI service tests
   - Add Database service tests

2. **E2E Tests**
   - Playwright for full user flows
   - Browser testing
   - Visual regression testing

3. **Performance Tests**
   - Load testing with k6
   - Benchmark critical paths
   - Memory leak detection

4. **Mutation Testing**
   - Stryker for mutation coverage
   - Ensure tests catch bugs

## Documentation

For more detailed information, see:

- **SPRINT3_TESTING.md** - Complete testing guide
- **API_DOCUMENTATION.md** - API reference
- **SPRINT3_SUMMARY.md** - Sprint 3 summary

## Troubleshooting

### Tests failing?

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Clear coverage cache:
   ```bash
   rm -rf coverage .nyc_output
   ```

3. Run tests in verbose mode:
   ```bash
   npx vitest run --reporter=verbose
   ```

### Coverage not generating?

1. Ensure @vitest/coverage-v8 is installed
2. Check vite.config.ts has test.coverage configured
3. Run with explicit coverage flag:
   ```bash
   npx vitest run --coverage
   ```

## Contributing

When adding new tests:

1. Follow existing patterns
2. Use descriptive test names
3. Mock external dependencies
4. Aim for >80% coverage on new code
5. Test both success and error cases
6. Add comments for complex test logic

---

**Total Tests:** 56 passing  
**Last Updated:** January 30, 2026  
**Maintained by:** Development Team
