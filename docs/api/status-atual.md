# Status Atual das APIs

**Data:** 18/11/2025

---

## 📊 Estatísticas Gerais

```
Total de Rotas: 29
├─ Conformes (com Use Cases): 13 (45%) ✅
├─ Fora do Padrão: 16 (55%) ❌
│  ├─ Crítico (duplicadas): 2 rotas
│  ├─ Alto (complexas): 4 rotas
│  └─ Médio (simples): 9 rotas
└─ Exceções: 1 rota (health check)

Linhas de Código Fora do Padrão: ~1.545 linhas
```

---

## ✅ Rotas Conformes (13 rotas)

| Rota | Métodos | Use Case | Loc |
|------|---------|----------|-----|
| `/api/v1/clientes` | GET, POST | ListarClientesUseCase<br>CriarClienteUseCase | /app/api/v1/clientes/route.ts:1 |
| `/api/v1/clientes/[id]` | GET, PUT | BuscarClienteUseCase<br>AtualizarClienteUseCase | /app/api/v1/clientes/[id]/route.ts:1 |
| `/api/v1/produtos` | GET, POST | ListarProdutosUseCase<br>CriarProdutoUseCase | /app/api/v1/produtos/route.ts:1 |
| `/api/v1/cobrancas` | POST | CriarCobrancaUseCase | /app/api/v1/cobrancas/route.ts:1 |
| `/api/v1/cobrancas/[id]/pagar` | POST | PagarCobrancaUseCase | /app/api/v1/cobrancas/[id]/pagar/route.ts:1 |
| `/api/v1/balancos` | POST | CriarBalancoUseCase | /app/api/v1/balancos/route.ts:1 |
| `/api/v1/contas-a-pagar` | GET, POST | ListarContasPagarUseCase<br>CriarContaPagarUseCase | /app/api/v1/contas-a-pagar/route.ts:1 |
| `/api/v1/contas-a-pagar/[id]` | PUT, DELETE | AtualizarContaPagarUseCase<br>DeletarContaPagarUseCase | /app/api/v1/contas-a-pagar/[id]/route.ts:1 |
| `/api/v1/contas-a-pagar/[id]/marcar-paga` | PATCH | MarcarComoPagaUseCase | /app/api/v1/contas-a-pagar/[id]/marcar-paga/route.ts:1 |
| `/api/v1/contas-a-pagar/[id]/marcar-pago` | PATCH | MarcarComoPagoUseCase | /app/api/v1/contas-a-pagar/[id]/marcar-pago/route.ts:1 |
| `/api/v1/contas-a-pagar/relatorio` | GET | RelatorioComparativoUseCase | /app/api/v1/contas-a-pagar/relatorio/route.ts:1 |
| `/api/v1/contratos` | GET | Queries Prisma diretas | /app/api/v1/contratos/route.ts:1 |
| `/api/v1/contratos/gerar` | POST | GerarContratoUseCase | /app/api/v1/contratos/gerar/route.ts:1 |
| `/api/v1/contratos/preview` | POST | GerarContratoUseCase | /app/api/v1/contratos/preview/route.ts:1 |

---

## ❌ Rotas Fora do Padrão (16 rotas)

### 🔴 Crítico - Duplicadas

| Rota | Linhas | Problema | Loc |
|------|--------|----------|-----|
| `/api/clients` | 280+ | Lógica complexa, duplica v1/clientes | /app/api/clients/route.ts:1 |
| `/api/clients/[id]` | 90 | Duplica v1/clientes/[id] | /app/api/clients/[id]/route.ts:1 |

### 🟠 Alto - Complexas

| Rota | Linhas | Problema | Loc |
|------|--------|----------|-----|
| `/api/dashboard` | 298 | 15+ queries, KPIs, sem use cases | /app/api/dashboard/route.ts:1 |
| `/api/eventual-clients` | 259 | Lógica parcelamento complexa | /app/api/eventual-clients/route.ts:1 |
| `/api/cobrancas` | 121 | Cálculos, duplica v1 | /app/api/cobrancas/route.ts:1 |
| `/api/cobrancas/[id]` | 107 | Lógica pagamento + balanço | /app/api/cobrancas/[id]/route.ts:1 |

### 🟡 Médio - Simples

| Rota | Problema | Loc |
|------|----------|-----|
| `/api/balancos` | CRUD direto Prisma | /app/api/balancos/route.ts:1 |
| `/api/balancos/[id]` | CRUD direto Prisma | /app/api/balancos/[id]/route.ts:1 |
| `/api/categorias` | CRUD simples | /app/api/categorias/route.ts:1 |
| `/api/produtos` | Duplica v1/produtos | /app/api/produtos/route.ts:1 |
| `/api/servicos` | Filtra produtos | /app/api/servicos/route.ts:1 |
| `/api/eventual-clients/[id]` | Update/delete simples | /app/api/eventual-clients/[id]/route.ts:1 |
| `/api/eventual-clients/[id]/parcelas` | Query simples | /app/api/eventual-clients/[id]/parcelas/route.ts:1 |
| `/api/historico-honorario` | CRUD simples | /app/api/historico-honorario/route.ts:1 |

---

## 🎯 Prioridades de Refatoração

### Prioridade 1 - URGENTE (2-3 dias)

Eliminar duplicações:

1. ✅ `/api/clients` → Migrar para `CriarClienteUseCase`, `ListarClientesUseCase`
2. ✅ `/api/clients/[id]` → Usar `/api/v1/clientes/[id]`
3. ✅ `/api/cobrancas` → Usar `/api/v1/cobrancas`
4. ✅ `/api/produtos` → Usar `/api/v1/produtos`

### Prioridade 2 - ALTA (2-3 dias)

Encapsular lógica complexa:

5. Criar `ObterMetricasDashboardUseCase` → `/api/dashboard`
6. Criar `CriarClienteEventualUseCase` → `/api/eventual-clients`
7. Criar `AtualizarCobrancaUseCase` → `/api/cobrancas/[id]`

### Prioridade 3 - MÉDIA (1-2 dias)

Padronizar rotas simples:

8. Criar use cases para `/api/balancos`
9. Criar use cases para `/api/categorias`
10. Migrar `/api/v1/contratos` (GET) para use case

---

## 📈 Progresso

```
Migração API: 45% completo

[█████████░░░░░░░░░░░] 13/29 rotas

Próximo milestone: 70% (20/29 rotas)
Prazo estimado: +2-3 dias
```

---

## 🔗 Documentos Relacionados

- [Rotas Legacy Detalhadas](/docs/api/rotas-legacy.md)
- [Rotas v1 Detalhadas](/docs/api/rotas-v1.md)
- [Plano de Migração](/docs/api/plano-migracao-api.md)
- [ADR-002: Use Cases Pattern](/docs/adrs/002-use-cases-pattern.md)
- [ADR-005: API Versioning](/docs/adrs/005-api-versioning.md)

---

**Última Atualização:** 18/11/2025
