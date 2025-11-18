# Plano de Refatoração de Rotas

**Objetivo:** Migrar de tabs para rotas reais do Next.js App Router

**Estimativa:** 3-5 dias

---

## Mapeamento Tabs → Rotas

| Tab Atual | Componente | Rota Nova | Prioridade |
|-----------|-----------|-----------|------------|
| `dashboard` | Dashboard | `/dashboard` | Alta |
| `clients` | ClientsHub | `/clientes` | Alta |
| `clients-fixed` | ClientsManagement | `/clientes/fixos` | Alta |
| `clients-eventual` | EventualClientsManagement | `/clientes/eventuais` | Alta |
| `receivables` | ReceivablesManagement | `/recebimentos` | Média |
| `payables` | PayablesManagement | `/contas-a-pagar` | Média |
| `reports` | ContractsManagement | `/contratos` | Média |

---

## Estrutura de Rotas Proposta

```
/app
  layout.tsx               # Root (ThemeProvider)
  page.tsx                 # Redirect para /dashboard

  (dashboard)/             # Route group
    layout.tsx             # Layout com Sidebar
    dashboard/page.tsx
    clientes/
      page.tsx             # Hub
      fixos/page.tsx
      eventuais/page.tsx
    recebimentos/page.tsx
    contas-a-pagar/page.tsx
    contratos/page.tsx
```

---

## Checklist de Implementação

### Fase 1: Preparação
- [ ] Criar route group `(dashboard)`
- [ ] Criar layout com Sidebar
- [ ] Criar páginas vazias para testar estrutura

### Fase 2: Migração de Componentes
- [ ] Mover componentes de página para `/app/(dashboard)/`
- [ ] Atualizar imports
- [ ] Adicionar metadata por página

### Fase 3: Atualizar Navegação
- [ ] Converter Sidebar para usar `<Link>`
- [ ] Remover `useState` de `activeTab`
- [ ] Remover props `onNavigate`

### Fase 4: Loading e Errors
- [ ] Adicionar `loading.tsx` files
- [ ] Adicionar `error.tsx` files
- [ ] Testar estados de carregamento

### Fase 5: Limpeza
- [ ] Remover `/app/page.tsx` antigo
- [ ] Validar todas as rotas
- [ ] Testar navegação completa

---

Ver também: [ADR-003](/docs/adrs/003-app-router-migration.md) | [Plano 02](/docs/planos-acao/02-migrar-app-router.md)

---

**Última Atualização:** 18/11/2025
