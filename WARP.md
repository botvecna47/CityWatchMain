# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

CityWatch is a full-stack civic engagement platform that connects citizens with local authorities to report and track community issues in real-time. The application enables citizens to report issues (garbage, road damage, water issues, power outages) while authorities can respond with updates and track resolution progress.

## Architecture Overview

### Tech Stack
- **Backend**: Node.js + Express with SQLite database via Prisma ORM
- **Frontend**: React (Vite) with Tailwind CSS for styling
- **Authentication**: JWT-based auth with refresh tokens and role-based access
- **Database**: SQLite with comprehensive schema for multi-city operations
- **File Handling**: Multer for uploads, Sharp for image processing
- **Security**: Helmet, CORS, rate limiting, input sanitization

### Multi-Tenant Architecture
The system is designed around **city-based scoping** where:
- Users belong to specific cities (cityId foreign key)
- Reports are automatically city-scoped to prevent cross-city data leakage  
- Authorities only see reports from their assigned city
- Notifications are filtered by city context

### Role-Based System
Three distinct user roles with different capabilities:
- **Citizens**: Create reports, comment, upload files, close their own reports
- **Authorities**: View all city reports, add official updates, change report status
- **Admins**: Full system access, user management, cross-city oversight

### Database Schema Key Models
- **Users**: Multi-role system with city assignments and profile management
- **Reports**: Issue tracking with categories, status workflow, and geo-coordinates
- **AuthorityUpdate**: Official responses that can change report status
- **Comments**: Discussion threads on reports
- **Notifications**: Real-time notification system with 30-second polling
- **AuditLog**: Complete audit trail for admin actions
- **ReportEmbedding**: AI-powered duplicate detection using embeddings

## Essential Commands

### Development Setup
```bash
# Backend setup (from backend/ directory)
npm install
cp env.example .env  # Configure your environment variables
npx prisma generate  # Generate Prisma client
npx prisma db push   # Set up database schema
npm run dev          # Start backend with nodemon

# Frontend setup (from frontend/ directory)  
npm install
npm run dev          # Start Vite dev server (usually localhost:5173)
```

### Database Operations
```bash
# From backend/ directory
npx prisma generate              # Generate Prisma client after schema changes
npx prisma db push              # Push schema changes to SQLite database
npx prisma migrate dev          # Create and apply migrations
npx prisma studio               # Launch database GUI browser
npx prisma db seed              # Run seed data (if seed script exists)
```

### Code Quality & Testing
```bash
# Backend linting and formatting
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Prettier formatting

# Frontend linting and formatting  
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Prettier formatting

# Build commands
npm run build         # Build frontend for production
npm run preview       # Preview production build
```

### Special Utilities
```bash
# Backend utilities (from backend/ directory)
node comprehensive-seed.js      # Seed database with sample data
node check-users.js            # Debug user data and roles
node debug-duplicate.js        # Test duplicate detection functionality
npm run cleanup               # Clean orphaned uploaded files
```

## Key Architectural Patterns

### Security-First Design
The codebase implements comprehensive security measures:
- **Environment-aware rate limiting** (strict in production, relaxed in development)
- **Comprehensive input sanitization** protecting against XSS, injection attacks
- **Token blacklisting system** for secure logout functionality
- **File upload security** with magic byte validation and extension filtering
- **Role-based access control** with city-scoped data isolation

### Real-Time Features
- **30-second polling** for notifications (not WebSockets)
- **Notification system** with read/unread status and city-based filtering
- **Dynamic status updates** for reports without page refreshes

### AI-Powered Duplicate Detection
Advanced duplicate report detection system:
- **Primary**: AI embeddings using Ollama (local) or OpenAI models
- **Fallback**: Rule-based similarity matching using Jaccard/Levenshtein
- **Geo-temporal filtering**: Only compares nearby reports within time window
- **User override**: Users can submit anyway after seeing potential duplicates

### File Management System
Organized asset storage with automatic cleanup:
- **Profiles**: User profile pictures in `assets/profiles/`
- **Reports**: Report attachments in `assets/reports/`
- **Security**: Magic byte validation, extension filtering, size limits

## Critical Environment Variables

Essential configuration in `backend/.env`:
```bash
# Core requirements
JWT_SECRET=your-32-char-secret              # Must be 32+ characters
JWT_REFRESH_SECRET=your-32-char-secret      # Must be 32+ characters  
DATABASE_URL="file:./dev.db"               # SQLite database path
NODE_ENV=development|production             # Environment mode
FRONTEND_URL=http://localhost:5173          # CORS configuration

# Optional AI duplicate detection
DUPLICATE_CHECK_ENABLED=true
OLLAMA_URL=http://localhost:11434           # Local AI model
# OR OPENAI_API_KEY=your-key                # External AI service
```

## API Architecture

### RESTful Endpoint Structure
```
/api/auth/*          - Authentication (login, register, refresh)
/api/reports/*       - Report CRUD and duplicate checking
/api/comments/*      - Comment system for reports
/api/notifications/* - Real-time notification management
/api/users/*         - User profile and city management
/api/admin/*         - Administrative functions (user management, audit logs)
/api/cities/*        - City data and management
/api/attachments/*   - File upload and serving
/api/alerts/*        - City-wide alert system
/api/events/*        - Community events management
/api/ai/*            - AI assistant integration
/api/analytics/*     - Reporting and analytics
```

### Authentication Flow
1. User registers/logs in → receives JWT access token + refresh token
2. Access token used for API requests (expires quickly)
3. Refresh token used to get new access token (longer expiry)
4. Token blacklisting on logout invalidates both tokens
5. Banned users have all tokens invalidated

### Report Workflow
1. **Creation**: Citizens create reports → automatically city-scoped
2. **Duplicate Check**: AI/rule-based duplicate detection → user override option
3. **Notification**: Authorities in city receive notifications
4. **Updates**: Authorities add updates → status changes → citizen notifications
5. **Resolution**: Status progresses OPEN → IN_PROGRESS → RESOLVED → CLOSED

## Frontend Architecture

### Component Structure
- **Pages**: Main route components (Dashboard, CreateReport, etc.)
- **Components**: Reusable UI components with consistent patterns
- **Contexts**: Global state management (Auth, Notifications, Theme, Toast)
- **Hooks**: Custom React hooks for common functionality
- **Utils**: Helper functions and API configuration

### Context Providers
- **AuthContext**: User authentication and role-based access
- **NotificationContext**: Real-time notification polling and state
- **ThemeContext**: UI theming and dark mode support
- **ToastContext**: User feedback and error messaging

### Route Protection
Uses `ProtectedRoute` component for role-based access control:
- Routes check user authentication status
- Role-based rendering for different user types
- Automatic redirects for unauthorized access

## Development Guidelines

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma generate` to update client
3. Use `npx prisma db push` for dev or `npx prisma migrate dev` for production
4. Update TypeScript types if using TypeScript features

### Adding New Features
1. **Backend**: Create controller → add routes → update middleware if needed
2. **Frontend**: Create components → add to routing → update contexts if global state needed
3. **Database**: Add models to Prisma schema → migrate → update related queries

### Security Considerations
- All API endpoints require authentication except `/auth/login` and `/auth/register`
- File uploads are validated by magic bytes, not just extensions
- City-scoping is enforced at the database level, not just frontend
- Input sanitization happens automatically via middleware
- Rate limiting is environment-aware (strict in production)

### Testing Duplicate Detection
```bash
# Test the duplicate detection system
node debug-duplicate.js

# Test specific endpoints
curl -X POST http://localhost:5000/api/reports/check-duplicate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Test report","description":"Test description","latitude":40.7128,"longitude":-74.0060}'
```

### Performance Optimization
- Database queries use indexes for common lookups (city, status, dates)
- File serving includes caching headers and compression
- Notification polling is optimized with city-scoped queries
- Large file uploads are size-limited and validated efficiently

## Key Business Logic

### City-Based Data Isolation
All data operations respect city boundaries:
- Users can only see reports from their assigned city
- Notifications are city-scoped to prevent information leakage  
- Admin users have cross-city access for oversight

### Status Workflow Enforcement
Reports follow a strict status progression:
- Citizens can only close their own RESOLVED reports
- Authorities can transition between any status states
- Status changes trigger automatic notifications

### Audit Trail
All administrative actions are logged:
- User role changes (promote/demote)
- User bans/unbans
- Report deletions (soft delete with audit trail)
- Complete metadata tracking for compliance