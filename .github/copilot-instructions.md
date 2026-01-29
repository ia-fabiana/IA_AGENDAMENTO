# Copilot Instructions for IA.AGENDAMENTOS

## Project Overview

IA.AGENDAMENTOS is an intelligent appointment management system built with React and Node.js. The application integrates with WhatsApp (via Evolution API), Google Calendar, and uses AI (Gemini) for intelligent scheduling and conversation handling. It features a multi-tenant architecture with role-based access control.

## Technology Stack

- **Frontend**: React 19.2.3, TypeScript 5.8.2, Vite 6.2.0
- **Backend**: Node.js 22 (Alpine), Express 4.18.2
- **AI/ML**: Google Gemini API (@google/genai 1.38.0)
- **Database**: Supabase (@supabase/supabase-js 2.93.2)
- **External APIs**: 
  - Evolution API for WhatsApp integration
  - Google Calendar API (googleapis 170.1.0)
- **UI Icons**: Lucide React 0.562.0
- **Deployment**: Google Cloud Run, Docker, Nginx

## Project Structure

```
/
├── services/          # Backend services (TypeScript)
│   ├── aiService.ts          # Gemini AI integration
│   ├── authService.ts        # Authentication logic
│   ├── calendarService.ts    # Google Calendar integration
│   ├── evolutionService.ts   # WhatsApp/Evolution API
│   ├── geminiService.ts      # AI service wrapper
│   ├── supabase.ts          # Database client
│   └── tenantService.ts     # Multi-tenant management
├── views/             # React view components
│   ├── Dashboard.tsx
│   ├── Agents.tsx
│   ├── Training.tsx
│   ├── ChatSimulation.tsx
│   ├── Connections.tsx
│   ├── Architecture.tsx
│   ├── Appointments.tsx
│   ├── PlanAndCredits.tsx
│   ├── AdminDashboard.tsx
│   ├── TenantManagement.tsx
│   └── Login.tsx
├── components/        # Reusable React components
├── migrations/        # SQL database migrations
├── server.js          # Express backend server
├── App.tsx           # Main React application
├── index.tsx         # React entry point
└── types.ts          # TypeScript type definitions
```

## Common Commands

```bash
# Development
npm install          # Install dependencies
npm run dev         # Start Vite dev server (frontend)
npm run server      # Start Express backend server
npm start           # Start backend server (alias)

# Production
npm run build       # Build frontend for production
npm run preview     # Preview production build

# Docker
docker build -t ia-agendamentos .
docker run -p 8080:8080 ia-agendamentos
```

## Code Style and Conventions

### TypeScript/JavaScript
- Use **TypeScript** for all new service files (.ts) and React components (.tsx)
- Use **ES modules** (`import`/`export`) - not CommonJS
- Prefer **arrow functions** for React components: `const Component: React.FC = () => {}`
- Use **async/await** for asynchronous operations
- Always define **explicit types** - avoid `any`

### React Components
- Use **functional components** with hooks
- Place state at the appropriate level (lift state up when needed)
- Component files use **PascalCase**: `Dashboard.tsx`, `Layout.tsx`
- Props interfaces should be defined above the component

Example:
```typescript
interface DashboardProps {
  tenantId: string;
  onUpdate: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tenantId, onUpdate }) => {
  // Component logic
};
```

### Services
- Service files are in `/services/` directory
- Use TypeScript for type safety
- Export service objects or functions, not classes
- Handle errors gracefully with try/catch

Example:
```typescript
export const myService = {
  async getData(): Promise<Data> {
    try {
      // Implementation
    } catch (error) {
      console.error('Error in myService.getData:', error);
      throw error;
    }
  }
};
```

### Naming Conventions
- **Files**: camelCase for services (`calendarService.ts`), PascalCase for components (`Dashboard.tsx`)
- **Variables**: camelCase (`tenantId`, `isConnected`)
- **Constants**: UPPER_SNAKE_CASE (`EVOLUTION_URL`, `PORT`)
- **Types/Interfaces**: PascalCase (`AppRoute`, `UserCredits`)
- **Enums**: PascalCase for enum name, UPPER_CASE for values

## Environment Variables

All sensitive configuration uses environment variables. Never commit secrets to the repository.

Required variables (see `.env.example`):
- `EVOLUTION_URL` - Evolution API endpoint for WhatsApp
- `EVOLUTION_KEY` - Evolution API authentication key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - OAuth callback URL
- `PORT` - Server port (default: 8080)

## Multi-Tenant Architecture

The application supports multiple tenants (customers):
- Each tenant has their own configuration, agents, and data
- Tenant ID is passed via URL query parameter `?tenant=<uuid>` for users
- Admin users access without tenant parameter
- All database operations should include tenant_id filtering

## Database Schema

Using Supabase PostgreSQL with these key tables:
- `tenants` - Tenant configuration and metadata
- `agents` - AI agents per tenant
- `training_data` - Custom training data for AI
- `appointments` - Scheduled appointments
- `google_calendar_tokens` - OAuth tokens for Google Calendar
- `services` - Business services offered

Migrations are in `/migrations/` directory.

## Testing Strategy

Currently no automated tests. When adding tests:
- Use a testing framework consistent with the React/TypeScript stack (e.g., Vitest, Jest)
- Place test files next to the code they test with `.test.ts` or `.spec.ts` suffix
- Mock external API calls (Evolution API, Google Calendar, Gemini)

## API Integration Guidelines

### Evolution API (WhatsApp)
- Base URL configured via `EVOLUTION_URL` environment variable
- Uses API key authentication via `EVOLUTION_KEY`
- Service wrapper in `services/evolutionService.ts`

### Google Calendar
- OAuth 2.0 flow implemented in `services/calendarService.ts`
- Tokens stored in Supabase `google_calendar_tokens` table
- Follow setup guide in `GOOGLE_CALENDAR_SETUP.md`

### Gemini AI
- Service wrapper in `services/aiService.ts` and `services/geminiService.ts`
- Used for intelligent appointment scheduling and chat responses
- Handle rate limits and errors gracefully

## Security and Safety

### Must Never Do
- **Never commit** `.env` files or expose API keys/secrets in code
- **Never delete** the `/services/` directory or core service files
- **Never modify** database credentials or production configuration without review
- **Never expose** internal tenant IDs or user data in client-side code
- **Never bypass** authentication checks in protected routes

### Security Best Practices
- Always validate and sanitize user inputs
- Use prepared statements for database queries (Supabase client handles this)
- Implement proper CORS configuration (already configured in `server.js`)
- Keep OAuth tokens encrypted and never log them
- Follow the principle of least privilege for database access

## Deployment

The application deploys to **Google Cloud Run** via Docker:
1. Multi-stage Dockerfile builds frontend with Vite
2. Production image includes built frontend + Express backend
3. Cloud Build configuration in `cloudbuild.yaml`
4. Nginx can be used as reverse proxy (see `nginx.conf`)

Health check endpoint: `GET /health` (returns `{ status: 'ok', timestamp: '...' }`)

## Contribution Guidelines

When making changes:
1. **Minimize modifications** - only change what's necessary
2. **Test locally** before committing using `npm run dev` and `npm run server`
3. **Update types** in `types.ts` when adding new data structures
4. **Document** complex logic with inline comments
5. **Follow existing patterns** - consistency is key
6. **Handle errors** - always include error handling for async operations
7. **Check migrations** - if modifying database schema, create a migration in `/migrations/`

## Common Patterns

### Fetching data from Supabase
```typescript
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('tenant_id', tenantId);

if (error) {
  console.error('Database error:', error);
  throw error;
}
```

### Making API requests
```typescript
import axios from 'axios';

const response = await axios.post(
  `${EVOLUTION_URL}/endpoint`,
  { data },
  {
    headers: {
      'apikey': EVOLUTION_KEY,
      'Content-Type': 'application/json'
    }
  }
);
```

### React state management
```typescript
const [state, setState] = useState<Type>(initialValue);

useEffect(() => {
  // Side effects here
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

## Additional Resources

- Google Calendar setup: See `GOOGLE_CALENDAR_SETUP.md`
- Project README: See `README.md`
- Evolution API documentation: (provided separately)
- Gemini API documentation: https://ai.google.dev/docs
