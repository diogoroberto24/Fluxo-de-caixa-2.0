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
- **Architecture Pattern**: Clean Architecture with Domain-Driven Design principles

### Clean Architecture Layers

#### 1. **Shared Layer** (`/shared`)

- **validation/**: Zod schemas compartilhados entre frontend e backend
- **types/**: TypeScript types e interfaces
- **constants/**: Constantes de negócio e configurações
- **utils/**: Funções utilitárias puras (money, formatters, etc)

#### 2. **Domain Layer** (`/server/domain`)

- Entidades de negócio (Cliente, Cobranca, Servico, etc)
- Value Objects (Money, Documento)
- Regras de negócio puras
- Sem dependências externas

#### 3. **Application Layer** (`/server/use-cases`)

- Casos de uso organizados por domínio
- Orquestra entidades e repositories
- Implementa lógica de aplicação
- Validação de entrada com Zod

#### 4. **Infrastructure Layer** (`/server/infra`)

- **repos/**: Repositories com Prisma
- **http/adapters/**: Adaptadores para Next.js
- **queue/**: Workers com BullMQ
- **payments/**: Integrações de pagamento
- **mail/**: Serviços de email

#### 5. **Presentation Layer** (`/app`)

- API Routes (handlers Next.js)
- React Components
- Forms com validação Zod compartilhada

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

- `/shared` - Código compartilhado entre client e server
  - `/validation` - Schemas Zod para forms e API
  - `/types` - TypeScript types/interfaces
  - `/utils` - Funções utilitárias
- `/app` - Next.js App Router
  - `/api/v1/` - Nova API RESTful versionada
  - `/(dashboard)` - Páginas do dashboard
- `/server` - Lógica de servidor (Clean Architecture)
  - `/domain` - Entidades e Value Objects
  - `/use-cases` - Casos de uso
  - `/infra` - Implementações de infraestrutura
- `/components` - React components
- `/lib` - Configurações e utilities Next.js
  - `/generated/prisma` - Cliente Prisma gerado
- `/prisma` - Schema do banco de dados
- `/jobs` - Entry points para background workers
- `/integrations` - Webhooks e integrações externas

### API Design

#### Estrutura RESTful v1

- `GET /api/v1/clientes` - Lista com paginação e filtros
- `POST /api/v1/clientes` - Criar novo cliente
- `GET /api/v1/clientes/:id` - Buscar cliente específico
- `PUT /api/v1/clientes/:id` - Atualizar completo
- `PATCH /api/v1/clientes/:id` - Atualizar parcial
- `DELETE /api/v1/clientes/:id` - Soft delete

#### Padrão de Resposta

```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

### Uso dos Use Cases

```typescript
// Exemplo de uso em API Route
import { CriarClienteUseCase } from '@/server/use-cases/clientes/criar-cliente'

const useCase = new CriarClienteUseCase()
const cliente = await useCase.execute(validatedData)
```

### Validação Compartilhada

```typescript
// Em formulário React
import { createClienteSchema } from '@/shared/validation/clientes'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(createClienteSchema)
})

// Na API
import { createClienteSchema } from '@/shared/validation/clientes'
const validated = createClienteSchema.parse(body)
```

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
- All monetary values are stored as Int in the database (cents)
- Timestamps follow Portuguese naming: `data_de_criacao`, `data_de_atualizacao`, `data_de_delecao`
- Value Objects handle complex types (Money, Documento)
- Use cases encapsulate business logic
- Repositories abstract database access
- Zod schemas are shared between frontend and backend
