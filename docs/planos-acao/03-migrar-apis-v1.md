# Plano 03: Migrar APIs para v1

**Duração:** 2-3 dias | **Prioridade:** Alta

---

## Objetivo

Eliminar rotas legacy `/api/*` e usar apenas `/api/v1/*` com Clean Architecture.

---

## Checklist

### Prioridade 1: Clientes (Dia 1)

- [ ] Validar use cases existem:
  - CriarClienteUseCase ✅
  - ListarClientesUseCase ✅
  - BuscarClienteUseCase ✅
  - AtualizarClienteUseCase ✅

- [ ] Atualizar componentes:
  - `components/clientes/fixos/clients-management.tsx`
  - `components/clientes/fixos/client-modal.tsx`

```typescript
// Antes
const res = await fetch('/api/clients')

// Depois
const res = await fetch('/api/v1/clientes')
```

- [ ] Adicionar lógica de cobrança inicial em use case (se necessário)
- [ ] Testar CRUD completo
- [ ] Deprecar `/api/clients/*`

### Prioridade 2: Dashboard (Dia 2)

- [ ] Criar use case `ObterMetricasDashboardUseCase`

```typescript
// /server/use-cases/dashboard/obter-metricas.ts
export class ObterMetricasDashboardUseCase extends UseCase {
  async handle() {
    // Migrar lógica de /api/dashboard
    return {
      kpis: {...},
      faturamentoMensal: [...],
      pagamentosRecentes: [...]
    }
  }
}
```

- [ ] Criar rota `/api/v1/dashboard`
- [ ] Atualizar `components/dashboard/dashboard.tsx`
- [ ] Deprecar `/api/dashboard`

### Prioridade 3: Clientes Eventuais (Dia 3)

- [ ] Criar use cases:
  - `CriarClienteEventualUseCase`
  - `AtualizarClienteEventualUseCase`
  - `DeletarClienteEventualUseCase`
  - `CriarParcelasUseCase`

- [ ] Criar rotas `/api/v1/clientes-eventuais/*`
- [ ] Atualizar componentes
- [ ] Deprecar `/api/eventual-clients/*`

### Bonus: Categorias e Outros

- [ ] Migrar `/api/categorias` → `/api/v1/categorias`
- [ ] Migrar `/api/balancos` → `/api/v1/balancos` (completar)

---

## Validação

- [ ] Nenhuma rota legacy em uso
- [ ] Todos os componentes usam `/api/v1/*`
- [ ] Testes passam
- [ ] Build sem erros

---

**Última Atualização:** 18/11/2025
