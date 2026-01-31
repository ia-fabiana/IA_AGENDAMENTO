# IA Agendamento - GitHub Copilot Instructions

## Project Overview

IA Agendamento is an intelligent appointment scheduling system with integration to Supabase and Google Calendar. The system consists of a React frontend with a Node.js Express backend for handling server-side operations.

## Technology Stack

### Frontend
- **React 19.2** with TypeScript
- **Vite 6.2** for build tooling
- **Lucide React** for icons
- Modern functional components with hooks

### Backend
- **Node.js** with Express 5.2
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **Google Gemini API** for AI capabilities
- **Google Calendar API** (googleapis) for calendar integration
- **Pino** for structured logging
- **Express Rate Limit** for API protection

### Testing
- **Vitest** for unit and integration tests
- **Supertest** for API testing
- **Happy DOM** for component testing
- **Coverage target**: Aim for 80%+ coverage on new code

### Infrastructure
- **Docker** for containerization
- **Google Cloud Build** for CI/CD
- **Nginx** for production serving

## Coding Standards

### TypeScript
- Use strict TypeScript configuration
- Always define explicit types for function parameters and return values
- Prefer interfaces over type aliases for object shapes
- Use enums for constants with multiple related values
- Avoid using `any` - use `unknown` when type is truly unknown
- Enable all strict compiler options

### React Components
- Use functional components exclusively (no class components)
- Prefer named exports over default exports for better refactoring
- Use React hooks (useState, useEffect, useCallback, useMemo) appropriately
- Always include proper dependency arrays in useEffect and useCallback
- Memoize expensive calculations with useMemo
- Keep components focused and single-purpose
- Extract complex logic into custom hooks

### Code Organization
- Group related functionality together
- Keep files under 300 lines when possible
- Use clear, descriptive names for functions and variables
- Follow the existing project structure:
  - `/components` - Reusable UI components
  - `/views` - Page-level components
  - `/services` - Business logic and API integrations
  - `/server` - Backend Express server
  - `/test` - Test files (unit and integration)
  - `/types.ts` - Shared TypeScript type definitions

### Naming Conventions
- **Components**: PascalCase (e.g., `AppointmentList.tsx`)
- **Functions**: camelCase (e.g., `fetchAppointments`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (e.g., `Appointment`, `UserCredits`)
- **Files**: Match the primary export name
- **Test files**: `*.test.ts` or `*.test.tsx`

### Async/Await
- Always use async/await for asynchronous operations
- Never use callbacks or raw promises with .then()
- Always handle errors with try/catch blocks
- Provide meaningful error messages

### Error Handling
- Use try/catch blocks for all async operations
- Log errors using the Pino logger service
- Provide user-friendly error messages in the UI
- Never expose internal error details to end users
- Use proper HTTP status codes in API responses

## Architecture Guidelines

### Frontend-Backend Separation
- Frontend handles UI/UX and state management
- Backend handles business logic, data persistence, and external API calls
- All sensitive operations (OAuth, encryption, API keys) must be server-side
- Use proper CORS configuration for API calls

### State Management
- Use React hooks for local component state
- Use useCallback for functions passed to child components
- Lift state up when multiple components need shared state
- Consider context API for deeply nested prop passing

### API Integration
- All Supabase operations should use the `dbService`
- Google Calendar operations should go through the backend server
- Use proper error handling and loading states
- Implement proper request/response typing

### Database
- Use Supabase for all data persistence
- Follow the existing schema in `/migrations`
- Use Row Level Security (RLS) policies for security
- Always use parameterized queries to prevent SQL injection

## Security Best Practices

### API Keys and Secrets
- **NEVER** commit API keys, tokens, or secrets to the repository
- Use environment variables for all sensitive configuration
- Follow the `.env.example` template for required variables
- Server-side API keys must never be exposed to the frontend

### Authentication & Authorization
- Use Supabase Auth for user authentication
- Implement proper RBAC (Role-Based Access Control) checks
- Validate permissions on both frontend and backend
- Use the RBAC service for permission checks

### Data Protection
- Use the encryption service for sensitive data
- Ensure HTTPS in production
- Implement proper CORS policies
- Sanitize all user inputs to prevent XSS
- Use CSP (Content Security Policy) headers

### Rate Limiting
- Use express-rate-limit for API endpoints
- Configure appropriate limits per endpoint
- Monitor and log rate limit violations

## Testing Requirements

### Unit Tests
- Write unit tests for all business logic
- Test components in isolation
- Mock external dependencies (APIs, databases)
- Use descriptive test names that explain the scenario
- Follow the Arrange-Act-Assert pattern

### Integration Tests
- Test API endpoints with Supertest
- Test database operations
- Test authentication flows
- Verify error handling paths

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should do something specific when condition', () => {
    // Arrange
    const input = setupTestData();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Running Tests
- Run `npm test` for watch mode during development
- Run `npm run test:run` for CI/CD
- Run `npm run test:coverage` to check coverage
- All tests must pass before merging

## Documentation Standards

### Code Comments
- Write self-documenting code with clear names
- Add comments only for complex business logic
- Explain "why" not "what" in comments
- Keep comments up-to-date with code changes
- Use JSDoc for public APIs and exported functions

### README and Documentation
- Keep README.md up-to-date with setup instructions
- Document environment variables in .env.example
- Update API_DOCUMENTATION.md for API changes
- Maintain architecture docs when making structural changes

### API Documentation
- Document all API endpoints in openapi.yaml
- Include request/response examples
- Document error responses
- Keep API documentation in sync with implementation

## Git and Version Control

### Commit Messages
- Use conventional commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep subject line under 72 characters
- Provide detailed description for complex changes

### Branch Strategy
- Create feature branches from main
- Use descriptive branch names (e.g., `feature/calendar-integration`)
- Keep pull requests focused and small
- Ensure all tests pass before merging

## Performance Considerations

### Frontend Performance
- Use lazy loading for routes and heavy components
- Optimize re-renders with React.memo when appropriate
- Debounce user input for search/filter operations
- Minimize bundle size by avoiding unnecessary dependencies

### Backend Performance
- Use connection pooling for database
- Implement caching where appropriate
- Use proper database indexes
- Monitor API response times with metrics

## Monitoring and Logging

### Logging
- Use Pino logger for all server-side logging
- Log at appropriate levels: error, warn, info, debug
- Include context (tenantId, userId) in logs
- Never log sensitive data (passwords, tokens, API keys)

### Monitoring
- Use prom-client for metrics collection
- Monitor API endpoint latency
- Track error rates
- Monitor database connection health

## Accessibility

### UI Components
- Use semantic HTML elements
- Provide proper ARIA labels
- Ensure keyboard navigation works
- Maintain proper color contrast ratios
- Test with screen readers when possible

## Dependencies

### Adding New Dependencies
- Prefer well-maintained packages with active communities
- Check package size before adding
- Review security advisories
- Update package.json and package-lock.json together
- Document why the dependency is needed

### Updating Dependencies
- Test thoroughly after updates
- Review breaking changes in changelogs
- Update one major dependency at a time
- Keep dependencies up-to-date for security

## Project-Specific Guidelines

### Multi-Tenancy
- Always include tenantId in database queries
- Implement proper tenant isolation
- Use the current tenant from context/state
- Validate tenant access in backend

### Appointments
- Validate appointment times against business hours
- Check for scheduling conflicts
- Respect minimum advance time requirements
- Handle timezone conversions properly

### Google Calendar Integration
- Always handle OAuth token refresh
- Store tokens encrypted in database
- Handle API rate limits gracefully
- Sync appointments bidirectionally

### AI Features (Gemini)
- Use appropriate model (gemini-3-flash-preview for speed)
- Set reasonable temperature values (0.7 default)
- Limit max tokens to control costs
- Handle AI API failures gracefully
- Never send sensitive user data to AI

## Common Patterns to Follow

### Loading States
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

try {
  setIsLoading(true);
  setError(null);
  const result = await apiCall();
  // Handle success
} catch (err) {
  setError(err.message);
  logger.error('Operation failed', { error: err });
} finally {
  setIsLoading(false);
}
```

### API Endpoints
```typescript
app.post('/api/appointments', async (req, res) => {
  try {
    const { tenantId } = req.body;
    // Validate input
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant ID required' });
    }
    
    // Process request
    const result = await service.create(req.body);
    
    return res.status(201).json(result);
  } catch (error) {
    logger.error('Failed to create appointment', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Things to Avoid

- ❌ Don't use `any` type
- ❌ Don't commit console.log statements
- ❌ Don't expose API keys in frontend code
- ❌ Don't skip error handling
- ❌ Don't write tests that depend on external services
- ❌ Don't create overly complex components (split them up)
- ❌ Don't ignore TypeScript errors
- ❌ Don't use deprecated React patterns (class components, etc.)
- ❌ Don't bypass RBAC checks
- ❌ Don't store sensitive data unencrypted

## When in Doubt

1. Check existing code for similar patterns
2. Refer to project documentation (README, architecture docs)
3. Follow TypeScript and React best practices
4. Prioritize security and user privacy
5. Write tests for your changes
6. Ask for review on complex changes
