# Plano de Migração de APIs

**Objetivo:** Migrar todas as 16 rotas legacy para `/api/v1` com Clean Architecture

**Estimativa Total:** 5-7 dias

---

## Fase 1: Eliminar Duplicações (2-3 dias)

### 1.1. Clientes Legacy → v1/clientes

**Rota:** `/api/clients/*` → `/api/v1/clientes/*`

**Ações:**
- [x] Use cases já existem (CriarClienteUseCase, ListarClientesUseCase)
- [ ] Atualizar componentes frontend para usar `/api/v1/clientes`
- [ ] Adicionar lógica de cobrança inicial em use case (se necessário)
- [ ] Adicionar lógica de associação de produtos em use case (se necessário)
- [ ] Deprecar `/api/clients`
- [ ] Remover após validação

**Componentes afetados:**
- `components/clients-management.tsx`
- `components/client-modal.tsx`

### 1.2. Cobranças Legacy → v1/cobrancas

**Rota:** `/api/cobrancas/*` → `/api/v1/cobrancas/*`

**Ações:**
- [x] CriarCobrancaUseCase existe
- [ ] Criar AtualizarCobrancaUseCase
- [ ] Atualizar componentes
- [ ] Deprecar `/api/cobrancas`

**Componentes afetados:**
- `components/receivables-management.tsx`
- `components/payment-modal.tsx`

### 1.3. Produtos Legacy → v1/produtos

**Ações:**
- [x] Use cases existem
- [ ] Atualizar componentes
- [ ] Deprecar `/api/produtos`

---

## Fase 2: Criar Use Cases Faltantes (2-3 dias)

### 2.1. Dashboard

**Use Cases a Criar:**
```
/server/use-cases/dashboard/
├── obter-metricas.ts            # ObterMetricasDashboardUseCase
├── calcular-faturamento-mensal.ts
└── obter-pagamentos-recentes.ts
```

**Rota:** `POST /api/v1/dashboard`

### 2.2. Clientes Eventuais

**Use Cases a Criar:**
```
/server/use-cases/clientes-eventuais/
├── criar-cliente-eventual.ts     # CriarClienteEventualUseCase
├── atualizar-cliente-eventual.ts
├── deletar-cliente-eventual.ts
└── criar-parcelas.ts             # CriarParcelasUseCase
```

**Rotas:**
- `POST /api/v1/clientes-eventuais`
- `PUT /api/v1/clientes-eventuais/[id]`
- `DELETE /api/v1/clientes-eventuais/[id]`

### 2.3. Categorias

**Use Cases a Criar:**
```
/server/use-cases/categorias/
├── criar-categoria.ts
├── listar-categorias.ts
├── atualizar-categoria.ts
└── deletar-categoria.ts
```

**Rotas:** `/api/v1/categorias`

### 2.4. Balanços

**Use Cases a Criar:**
```
/server/use-cases/balancos/
├── listar-balancos.ts
├── buscar-balanco.ts
├── atualizar-balanco.ts
└── deletar-balanco.ts
```

**Rotas:** `/api/v1/balancos/*`

---

## Fase 3: Migração de Componentes (1-2 dias)

**Atualizar componentes para usar APIs v1:**

- [ ] `dashboard.tsx` → `/api/v1/dashboard`
- [ ] `clients-management.tsx` → `/api/v1/clientes`
- [ ] `eventual-clients-management.tsx` → `/api/v1/clientes-eventuais`
- [ ] `receivables-management.tsx` → `/api/v1/balancos`
- [ ] Outros componentes conforme necessário

---

## Fase 4: Deprecação e Limpeza (1 dia)

**Ações:**
- [ ] Adicionar avisos de deprecação em rotas legacy
- [ ] Validar que nenhum componente usa rotas antigas
- [ ] Remover rotas legacy de `/app/api/*`
- [ ] Manter apenas `/api/v1/*` e `/api/health`

---

## Checklist por Rota

Para cada rota a migrar:

- [ ] Criar use case(s) em `/server/use-cases/{dominio}/`
- [ ] Criar schema Zod em `/shared/validation/` (se não existir)
- [ ] Criar rota em `/app/api/v1/{dominio}/`
- [ ] Atualizar componentes React
- [ ] Criar/atualizar custom hook (se aplicável)
- [ ] Testar CRUD completo
- [ ] Deprecar rota antiga
- [ ] Documentar mudanças

---

## Progresso

```
Fase 1: Duplicações        [░░░░░░░░░░] 0/4
Fase 2: Use Cases Novos    [░░░░░░░░░░] 0/4
Fase 3: Componentes        [░░░░░░░░░░] 0/8
Fase 4: Limpeza            [░░░░░░░░░░] 0/4

Total: 0% completo
```

---

**Última Atualização:** 18/11/2025
