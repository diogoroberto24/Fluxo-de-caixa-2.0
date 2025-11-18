# Rotas Legacy (Fora do Padrão)

**Total:** 16 rotas | **Linhas:** ~1.545 linhas

---

## 🔴 Crítico (2 rotas)

### 1. `/api/clients` (280+ linhas)

**Problema:** Duplicação total de `/api/v1/clientes`

**Issues:**
- Validação manual (não usa Zod)
- Lógica de negócio na rota (criação de cobrança + balanço automático)
- 73-102 linhas só para criar cobrança inicial
- 104-120 linhas para associar produtos

**Solução:** Usar `CriarClienteUseCase` da v1

###  `/api/clients/[id]` (90 linhas)

**Solução:** Deprecar, usar `/api/v1/clientes/[id]`

---

## 🟠 Alto (4 rotas)

### 3. `/api/dashboard` (298 linhas)

**Problemas:**
- 15+ queries Prisma diretas
- Cálculos complexos de KPIs
- Comparativos mensais

**Use Cases Necessários:**
- `ObterMetricasDashboardUseCase`
- `CalcularFaturamentoMensalUseCase`
- `ObterPagamentosRecentesUseCase`

### 4. `/api/eventual-clients` (259 linhas)

**Problemas:**
- 3 fluxos diferentes (à vista, parcelado, entrada+parcelas)
- Criação de cobranças e balanços (linhas 111-259)

**Use Cases Necessários:**
- `CriarClienteEventualUseCase`
- `CriarParcelasUseCase`

### 5-6. `/api/cobrancas` (121 linhas) e `/api/cobrancas/[id]` (107 linhas)

**Solução:** Migrar para `/api/v1/cobrancas`

---

## 🟡 Médio (9 rotas simples)

- `/api/balancos` - CRUD direto
- `/api/categorias` - CRUD simples
- `/api/produtos` - Duplica v1
- `/api/servicos` - Filtra produtos
- Outras rotas simples

---

Ver [Plano de Migração](/docs/api/plano-migracao-api.md) para detalhes completos.

---

**Última Atualização:** 18/11/2025
