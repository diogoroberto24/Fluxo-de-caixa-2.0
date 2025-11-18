# Documentação do Projeto - Fluxo de Caixa 2.0

> Sistema de Gestão Financeira - Anderson Cardozo Assessoria

## 📚 Índice Geral

Esta documentação contém decisões arquiteturais, planos de ação e análises técnicas do projeto.

### 🏗️ Architecture Decision Records (ADRs)

Decisões arquiteturais fundamentais do projeto:

1. [ADR-001: Clean Architecture](/docs/adrs/001-clean-architecture.md)
2. [ADR-002: Padrão Use Cases](/docs/adrs/002-use-cases-pattern.md)
3. [ADR-003: Migração App Router](/docs/adrs/003-app-router-migration.md)
4. [ADR-004: Organização de Componentes](/docs/adrs/004-component-organization.md)
5. [ADR-005: Versionamento de API](/docs/adrs/005-api-versioning.md)
6. [ADR-006: Padrão Custom Hooks](/docs/adrs/006-custom-hooks-pattern.md)

### 🔌 Documentação de API

Análise e planos para as APIs do projeto:

- [Status Atual das APIs](/docs/api/status-atual.md) - Visão geral e estatísticas
- [Rotas Legacy](/docs/api/rotas-legacy.md) - 16 rotas fora do padrão
- [Rotas v1](/docs/api/rotas-v1.md) - 13 rotas com Clean Architecture
- [Plano de Migração de APIs](/docs/api/plano-migracao-api.md) - Roadmap completo

### ⚛️ Documentação Frontend

Análise da estrutura atual do frontend:

- [Problemas Atuais](/docs/frontend/problemas-atuais.md) - 5 problemas principais identificados
- [Estrutura de Componentes](/docs/frontend/estrutura-componentes.md) - Inventário completo (42 componentes)
- [Plano de Refatoração de Rotas](/docs/frontend/plano-refatoracao-rotas.md) - Migração tabs → rotas

### 📋 Planos de Ação

Roteiro de refatoração dividido em 5 fases:

1. [Reorganizar Componentes](/docs/planos-acao/01-reorganizar-componentes.md) ⏱️ 2-3 dias
2. [Migrar para App Router](/docs/planos-acao/02-migrar-app-router.md) ⏱️ 3-5 dias
3. [Migrar APIs para v1](/docs/planos-acao/03-migrar-apis-v1.md) ⏱️ 2-3 dias
4. [Padronizar Custom Hooks](/docs/planos-acao/04-padronizar-hooks.md) ⏱️ 2-3 dias
5. [Melhorias Finais](/docs/planos-acao/05-melhorias-finais.md) ⏱️ 1-2 dias

**Estimativa Total:** 11-18 dias

---

## 🎯 Quick Start

### Para Novos Desenvolvedores

1. Leia os ADRs principais (001, 002, 003)
2. Revise o [Status Atual das APIs](/docs/api/status-atual.md)
3. Entenda os [Problemas Atuais do Frontend](/docs/frontend/problemas-atuais.md)
4. Siga o [CLAUDE.md](/CLAUDE.md) para comandos de desenvolvimento

### Para Contribuir com Refatoração

1. Escolha um plano de ação
2. Crie uma branch: `git checkout -b feat/nome-da-feature`
3. Siga o checklist do plano
4. Faça PR referenciando o documento

---

## 📊 Status do Projeto

### Backend (Clean Architecture Simplificada)

| Camada | Status | Observação |
|--------|--------|------------|
| Shared | ✅ Implementado | Types, validação Zod, utils |
| Infrastructure | ✅ Implementado | Repositories com Prisma |
| Use Cases | 🟡 Parcial | 45% das rotas migradas |
| Presentation | 🟡 Parcial | APIs v1 + rotas legacy |

> **Nota:** Este projeto usa uma versão simplificada de Clean Architecture sem camada Domain explícita. Tipos ficam em `/shared/types` e regras de negócio nos Use Cases.

### Frontend (Next.js 14)

| Aspecto | Status | Problema |
|---------|--------|----------|
| Rotas | ❌ Crítico | Tabs em vez de rotas reais |
| Componentes | 🟡 Médio | Desorganizados (24 no root) |
| APIs | 🟡 Médio | Mix de legacy e v1 |
| Hooks | 🟠 Alto | Apenas 1 hook padronizado |
| Layouts | 🟡 Médio | Sem layouts aninhados |

### APIs

| Tipo | Quantidade | Status |
|------|-----------|--------|
| Legacy (`/api/*`) | 16 rotas | ❌ Deprecar |
| v1 (`/api/v1/*`) | 13 rotas | ✅ Padrão |
| **Total** | **29 rotas** | 🟡 45% conforme |

---

## 🔍 Métricas Atuais

```
Componentes Frontend: 42 (18 UI + 24 Feature)
Linhas de Código (componentes): ~6.594 linhas
Rotas Reais (Next.js): 2 (/, /preview-contrato)
Tabs Simuladas: 7
Use Cases Implementados: ~20
Schemas Zod: 8
Custom Hooks: 2
TODOs Pendentes: 6
```

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Next.js 14.2 (App Router + API Routes)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Architecture**: Clean Architecture + DDD

### Frontend
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod
- **State**: React Hooks + Context
- **Charts**: Recharts

### DevOps
- **Container**: Docker (PostgreSQL, Redis, Mailhog)
- **Package Manager**: pnpm
- **Deployment**: Vercel (production)

---

## 📝 Convenções

### Commits
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `refactor:` Refatoração
- `docs:` Documentação
- `chore:` Tarefas de manutenção

### Branches
- `main` - Produção
- `test` - Desenvolvimento
- `feat/nome` - Features
- `fix/nome` - Correções
- `refactor/nome` - Refatorações

---

## 📞 Contato

- **Projeto**: Fluxo de Caixa 2.0
- **Cliente**: Anderson Cardozo Assessoria
- **Repositório**: `/Volumes/SSD/www/Fluxo-de-caixa-2.0`

---

## 📅 Histórico

- **2025-01**: Análise inicial e criação de ADRs
- **2025-01**: Implementação inicial de Clean Architecture
- **2025-01**: Migração parcial para APIs v1 (45%)

---

## 🎓 Recursos de Aprendizado

### Clean Architecture
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)

### Next.js App Router
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)

### Padrões de Código
- [Zod Validation](https://zod.dev/)
- [Prisma ORM](https://www.prisma.io/)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**Última Atualização:** 18/11/2025
