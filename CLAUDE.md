# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Database operations
npx prisma generate    # Generate Prisma client
npx prisma db push      # Push schema changes to database
npx prisma migrate dev  # Create and apply migrations
npx prisma studio       # Open Prisma Studio GUI

# Docker services (PostgreSQL, Redis, Mailhog)
docker-compose up -d    # Start all services
docker-compose down     # Stop all services
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 14.2 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and context
- **Background Services**: Redis for caching, Mailhog for email testing

### Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **Usuario**: System users with permission levels (ADMIN/SUPER/USER)
- **Cliente**: Business clients with address and tax information
- **Produto**: Products/services with categories and pricing
- **Cobranca**: Invoices with items and payment tracking
- **Balanco**: Financial entries (income/expenses)
- **Recorrencia**: Recurring transactions

Models use soft deletion pattern with `data_de_delecao` field and include metadata JSON fields for extensibility.

### Project Structure

- `/app` - Next.js App Router pages and API routes
  - `/api/v1/` - New versioned API endpoints (in development)
  - `/api/` - Current API endpoints (being deprecated)
- `/components` - React components
  - `/ui` - Reusable UI components (shadcn/ui based)
  - Business logic components (dashboard, modals, management views)
- `/lib` - Shared utilities and database setup
  - `/generated/prisma` - Generated Prisma client (custom output location)
- `/prisma` - Database schema and migrations
- `/server` - Server configuration and utilities
- `/tests` - Test files

### API Design

The application is transitioning from `/api/` to `/api/v1/` endpoints. New endpoints should follow RESTful conventions and be placed in the versioned directory.

### Environment Configuration

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `DATABASE_*` - Individual database connection parameters
- `REDIS_*` - Redis configuration
- `MAIL_*` - Email service configuration
- `JWT_*` - JWT keys for authentication (base64 encoded)

Use `.env.example` as template. Docker Compose provides local development services.

### Development Notes

- Prisma client is generated to `/lib/generated/prisma/` (non-standard location)
- The application uses soft deletion for data integrity
- All monetary values are stored as BigInt in the database
- Timestamps follow Portuguese naming: `data_de_criacao`, `data_de_atualizacao`, `data_de_delecao`
- The UI is built with v0.app and synced via GitHub
