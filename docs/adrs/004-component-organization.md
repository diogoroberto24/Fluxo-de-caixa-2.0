# ADR-004: Organização de Componentes por Feature

**Status:** Proposto
**Data:** Janeiro 2025

---

## Contexto

Atualmente há **24 componentes de feature** no root de `/components`, misturados com componentes UI. Isso dificulta:
- Encontrar componentes relacionados
- Entender dependências
- Manutenção e refatoração
- Onboarding de novos desenvolvedores

---

## Decisão

Reorganizar componentes por **feature/domínio**, não por tipo.

### Antes (Atual)
```
/components
├── ui/                        # 18 componentes shadcn/ui
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── dashboard.tsx              # ❌ Misturado no root
├── clients-hub.tsx
├── clients-management.tsx
├── client-modal.tsx
├── eventual-clients-management.tsx
├── eventual-client-modal.tsx
├── receivables-management.tsx
├── payables-management.tsx
├── contracts-management.tsx
├── payment-modal.tsx
└── ... (24 componentes)
```

### Depois (Proposto)
```
/components
├── ui/                        # Primitivos shadcn/ui
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
│
├── dashboard/                 # Feature: Dashboard
│   ├── dashboard.tsx
│   ├── revenue-chart.tsx
│   ├── recent-payments.tsx
│   └── index.ts              # Re-exports
│
├── clientes/                  # Feature: Clientes
│   ├── clients-hub.tsx
│   ├── fixos/
│   │   ├── clients-management.tsx
│   │   ├── client-modal.tsx
│   │   └── index.ts
│   ├── eventuais/
│   │   ├── eventual-clients-management.tsx
│   │   ├── eventual-client-modal.tsx
│   │   ├── parcelas-management-modal.tsx
│   │   └── index.ts
│   └── index.ts
│
├── recebimentos/              # Feature: Recebimentos
│   ├── receivables-management.tsx
│   ├── payment-modal.tsx
│   └── index.ts
│
├── contas-a-pagar/            # Feature: Contas a Pagar
│   ├── payables-management.tsx
│   ├── payables-chart.tsx
│   ├── expense-modal.tsx
│   └── index.ts
│
├── contratos/                 # Feature: Contratos
│   ├── contracts-management.tsx
│   ├── contract-date-modal.tsx
│   ├── contract-confirmation-modal.tsx
│   ├── reports-contracts.tsx
│   └── index.ts
│
├── layout/                    # Componentes de layout
│   ├── sidebar.tsx
│   ├── theme-toggle.tsx
│   └── index.ts
│
└── shared/                    # Componentes compartilhados
    ├── liquid-glass-effect.tsx
    └── index.ts
```

---

## Benefícios

1. **Co-location**: Componentes relacionados ficam juntos
2. **Imports Limpos**: `import { ClientsManagement } from '@/components/clientes/fixos'`
3. **Escala**: Fácil adicionar novos componentes
4. **Manutenção**: Mudanças em uma feature são localizadas

---

## Plano de Migração

Ver [Plano 01: Reorganizar Componentes](/docs/planos-acao/01-reorganizar-componentes.md)

**Estimativa:** 2-3 dias

---

**Última Atualização:** 18/11/2025
