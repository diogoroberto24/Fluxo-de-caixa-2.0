# Rotas v1 (Com Clean Architecture)

**Total:** 13 rotas | **Status:** ✅ Conformes

---

## Padrão de Implementação

Todas as rotas v1 seguem:

1. ✅ Use Cases para lógica de negócio
2. ✅ Validação com Zod compartilhado
3. ✅ Tratamento de erros padronizado
4. ✅ Resposta consistente (`{ success, data, error }`)

---

## Rotas Implementadas

### Clientes

- `GET /api/v1/clientes` - ListarClientesUseCase
- `POST /api/v1/clientes` - CriarClienteUseCase
- `GET /api/v1/clientes/[id]` - BuscarClienteUseCase
- `PUT /api/v1/clientes/[id]` - AtualizarClienteUseCase

### Produtos

- `GET /api/v1/produtos` - ListarProdutosUseCase
- `POST /api/v1/produtos` - CriarProdutoUseCase

### Cobranças

- `POST /api/v1/cobrancas` - CriarCobrancaUseCase
- `POST /api/v1/cobrancas/[id]/pagar` - PagarCobrancaUseCase

### Contas a Pagar

- `GET /api/v1/contas-a-pagar` - ListarContasPagarUseCase
- `POST /api/v1/contas-a-pagar` - CriarContaPagarUseCase
- `PUT /api/v1/contas-a-pagar/[id]` - AtualizarContaPagarUseCase
- `DELETE /api/v1/contas-a-pagar/[id]` - DeletarContaPagarUseCase
- `PATCH /api/v1/contas-a-pagar/[id]/marcar-paga` - MarcarComoPagaUseCase
- `GET /api/v1/contas-a-pagar/relatorio` - RelatorioComparativoUseCase

### Contratos

- `POST /api/v1/contratos/gerar` - GerarContratoUseCase
- `POST /api/v1/contratos/preview` - GerarContratoUseCase

### Balanços

- `POST /api/v1/balancos` - CriarBalancoUseCase

---

## Padrão de Resposta

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
  "code": "ERROR_CODE"
}

// Erro de Validação
{
  "success": false,
  "error": "Dados inválidos",
  "code": "VALIDATION_ERROR",
  "details": [
    { path: ["nome"], message: "Nome é obrigatório" }
  ]
}
```

---

**Última Atualização:** 18/11/2025
