# ADR-006: Padrão Custom Hooks

**Status:** Proposto
**Data:** Janeiro 2025

---

## Contexto

Atualmente apenas 1 hook customizado está implementado (`useContasPagar`). Outros componentes duplicam lógica de fetch, estado e tratamento de erros.

---

## Decisão

Criar **hooks customizados padronizados** para cada entidade principal, seguindo o padrão do `useContasPagar`.

---

## Interface Padrão

```typescript
interface UseEntityReturn<T> {
  // Estado
  data: T[]
  loading: boolean
  error: string | null

  // Operações CRUD
  criar: (data: CreateInput) => Promise<T>
  atualizar: (id: string, data: UpdateInput) => Promise<T>
  deletar: (id: string) => Promise<void>

  // Utilidades
  recarregar: () => Promise<void>
  limparErro: () => void
}
```

---

## Exemplo: useClientes

```typescript
// hooks/use-clientes.ts
import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Cliente, CreateClienteInput } from '@/shared/types'

export function useClientes() {
  const [data, setData] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const recarregar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/v1/clientes')
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error)
      }

      setData(json.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar'
      setError(message)
      toast({ variant: 'destructive', title: message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const criar = useCallback(async (input: CreateClienteInput) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/v1/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })

      const json = await res.json()

      if (!json.success) {
        throw new Error(json.error)
      }

      toast({ title: 'Cliente criado com sucesso!' })
      await recarregar()
      return json.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar'
      setError(message)
      toast({ variant: 'destructive', title: message })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast, recarregar])

  // ... atualizar, deletar

  return {
    data,
    loading,
    error,
    criar,
    atualizar,
    deletar,
    recarregar,
    limparErro: () => setError(null)
  }
}
```

---

## Hooks a Criar

- [ ] `useClientes`
- [ ] `useClientesEventuais`
- [ ] `useCobrancas`
- [ ] `useRecebimentos`
- [ ] `useContratos`
- [ ] `useProdutos`
- [ ] `useCategorias`

---

## Benefícios

1. **Reutilização**: Lógica centralizada
2. **Consistência**: Mesmo padrão em todo app
3. **Manutenção**: Mudanças em um lugar
4. **Testabilidade**: Hooks podem ser testados isoladamente

---

## Plano de Implementação

Ver [Plano 04: Padronizar Custom Hooks](/docs/planos-acao/04-padronizar-hooks.md)

**Estimativa:** 2-3 dias

---

**Última Atualização:** 18/11/2025
