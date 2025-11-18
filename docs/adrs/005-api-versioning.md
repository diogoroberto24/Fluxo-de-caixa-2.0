# ADR-005: Versionamento de API

**Status:** Parcialmente Implementado (45%)
**Data:** Janeiro 2025

---

## Contexto

O projeto possui **2 estruturas de API paralelas**:
- 14 rotas legacy em `/api/*` (sem use cases)
- 13 rotas v1 em `/api/v1/*` (com Clean Architecture)

Isso causa inconsistência e dificulta manutenção.

---

## Decisão

**Deprecar todas as rotas `/api/*`** e manter apenas **`/api/v1/*`** com Clean Architecture.

---

## Estrutura

### Rotas a Deprecar

| Rota Legacy | Status | Substituir por |
|-------------|--------|----------------|
| `/api/clients` | ❌ Crítico | `/api/v1/clientes` |
| `/api/cobrancas` | ❌ Alto | `/api/v1/cobrancas` |
| `/api/balancos` | ❌ Médio | `/api/v1/balancos` |
| `/api/dashboard` | ❌ Alto | `/api/v1/dashboard` (criar) |
| `/api/eventual-clients` | ❌ Alto | `/api/v1/clientes-eventuais` (criar) |
| `/api/categorias` | ❌ Médio | `/api/v1/categorias` (criar) |
| `/api/produtos` | ✅ Migrado | `/api/v1/produtos` |

---

## Padrão de Resposta v1

```typescript
// Sucesso
{
  "success": true,
  "data": {...}
}

// Erro
{
  "success": false,
  "error": "Mensagem de erro",
  "code": "ERROR_CODE",
  "details": [...] // Opcional (validação)
}
```

---

## Plano de Migração

Ver [Plano 03: Migrar APIs para v1](/docs/planos-acao/03-migrar-apis-v1.md)

**Estimativa:** 2-3 dias

---

**Última Atualização:** 18/11/2025
