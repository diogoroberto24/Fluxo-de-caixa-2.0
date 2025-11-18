# Plano 01: Reorganizar Componentes

**Duração:** 2-3 dias | **Prioridade:** Alta

---

## Objetivo

Reorganizar 24 componentes de `/components` por feature, melhorando manutenibilidade e co-location.

---

## Estrutura Nova

```
/components
├── ui/              # Manter primitivos shadcn/ui
├── dashboard/
│   ├── dashboard.tsx
│   ├── revenue-chart.tsx
│   ├── recent-payments.tsx
│   └── index.ts
├── clientes/
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
├── recebimentos/
│   ├── receivables-management.tsx
│   ├── payment-modal.tsx
│   └── index.ts
├── contas-a-pagar/
│   ├── payables-management.tsx
│   ├── payables-chart.tsx
│   ├── expense-modal.tsx
│   └── index.ts
├── contratos/
│   ├── contracts-management.tsx
│   ├── contract-date-modal.tsx
│   ├── contract-confirmation-modal.tsx
│   ├── reports-contracts.tsx
│   └── index.ts
├── layout/
│   ├── sidebar.tsx
│   ├── theme-toggle.tsx
│   └── index.ts
└── shared/
    ├── liquid-glass-effect.tsx
    └── index.ts
```

---

## Checklist

### Dia 1: Preparação e Estrutura

- [ ] Criar nova estrutura de pastas em `/components`
- [ ] Criar arquivos `index.ts` para re-exports

```typescript
// components/clientes/fixos/index.ts
export { ClientsManagement } from './clients-management'
export { ClientModal } from './client-modal'
```

### Dia 2: Migração de Arquivos

- [ ] Mover componentes de dashboard
- [ ] Mover componentes de clientes
- [ ] Mover componentes de recebimentos
- [ ] Mover componentes de contas-a-pagar
- [ ] Mover componentes de contratos
- [ ] Mover componentes de layout

### Dia 3: Atualizar Imports

- [ ] Atualizar imports em `/app/page.tsx`
- [ ] Atualizar imports entre componentes
- [ ] Testar aplicação completamente
- [ ] Remover arquivos antigos
- [ ] Commit das mudanças

---

## Comandos Úteis

```bash
# Criar estrutura
mkdir -p components/{dashboard,clientes/{fixos,eventuais},recebimentos,contas-a-pagar,contratos,layout,shared}

# Mover arquivos (exemplo)
mv components/dashboard.tsx components/dashboard/
mv components/clients-management.tsx components/clientes/fixos/
```

---

## Validação

- [ ] Nenhum erro de compilação
- [ ] Todos os componentes renderizam corretamente
- [ ] Imports funcionam
- [ ] Build passa (`pnpm build`)

---

**Última Atualização:** 18/11/2025
