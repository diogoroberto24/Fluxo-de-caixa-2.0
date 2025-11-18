# Estrutura de Componentes

**Total:** 42 componentes | **Linhas:** ~6.594 linhas

---

## Componentes UI (18)

Primitivos shadcn/ui baseados em Radix UI:

- **Forms:** input, label, textarea, select, checkbox
- **Feedback:** toast, toaster, dialog
- **Navigation:** tabs, command, popover
- **Display:** card, table, badge, button, avatar
- **Charts:** chart
- **Custom:** client-autocomplete

**Localização:** `/components/ui/`

---

## Componentes de Página (7)

Componentes que atuam como "páginas" (renderizados por switch/case):

1. **dashboard.tsx** - Dashboard principal com KPIs
2. **clients-hub.tsx** - Hub de seleção de tipo de cliente
3. **clients-management.tsx** - Gestão de clientes fixos
4. **eventual-clients-management.tsx** - Gestão de clientes eventuais
5. **receivables-management.tsx** - Gestão de recebimentos
6. **payables-management.tsx** - Gestão de contas a pagar
7. **contracts-management.tsx** - Gestão de contratos

**Problema:** Deveriam ser páginas reais em `/app/(dashboard)/`

---

## Componentes de Modal (8)

Dialogs/modals para operações:

- client-modal.tsx
- clients-modal.tsx
- eventual-client-modal.tsx
- payment-modal.tsx
- expense-modal.tsx
- parcelas-management-modal.tsx
- contract-date-modal.tsx
- contract-confirmation-modal.tsx

---

## Componentes de Visualização (5)

Widgets e gráficos:

- revenue-chart.tsx
- payables-chart.tsx
- reports-chart.tsx
- reports-contracts.tsx
- recent-payments.tsx

---

## Componentes de Layout (4)

UI compartilhada:

- sidebar.tsx
- theme-provider.tsx
- theme-toggle.tsx
- liquid-glass-effect.tsx

---

## Reorganização Proposta

Ver [ADR-004](/docs/adrs/004-component-organization.md) e [Plano 01](/docs/planos-acao/01-reorganizar-componentes.md)

---

**Última Atualização:** 18/11/2025
