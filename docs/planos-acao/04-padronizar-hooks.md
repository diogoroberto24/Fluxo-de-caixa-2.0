# Plano 04: Padronizar Custom Hooks

**Duração:** 2-3 dias | **Prioridade:** Média

---

## Objetivo

Criar hooks customizados padronizados para todas as entidades, seguindo o padrão do `useContasPagar`.

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

## Template de Hook

```typescript
// hooks/use-{entidade}.ts
import { useState, useCallback, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { Entity, CreateInput, UpdateInput } from '@/shared/types'

export function useEntity() {
  const [data, setData] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const recarregar = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/v1/entities')
      const json = await res.json()

      if (!json.success) throw new Error(json.error)
      setData(json.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro'
      setError(message)
      toast({ variant: 'destructive', title: message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const criar = useCallback(async (input: CreateInput) => {
    setLoading(true)
    try {
      const res = await fetch('/api/v1/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error)

      toast({ title: 'Criado com sucesso!' })
      await recarregar()
      return json.data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar'
      toast({ variant: 'destructive', title: message })
      throw err
    } finally {
      setLoading(false)
    }
  }, [toast, recarregar])

  const atualizar = useCallback(async (id: string, input: UpdateInput) => {
    // Similar ao criar
  }, [toast, recarregar])

  const deletar = useCallback(async (id: string) => {
    // Similar ao criar
  }, [toast, recarregar])

  useEffect(() => {
    recarregar()
  }, [recarregar])

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

## Checklist

### Dia 1: Hooks Principais

- [ ] Criar `hooks/use-clientes.ts`
- [ ] Criar `hooks/use-cobrancas.ts`
- [ ] Atualizar componentes para usar hooks

### Dia 2: Hooks Secundários

- [ ] Criar `hooks/use-clientes-eventuais.ts`
- [ ] Criar `hooks/use-recebimentos.ts`
- [ ] Criar `hooks/use-contratos.ts`
- [ ] Atualizar componentes

### Dia 3: Finalização

- [ ] Criar `hooks/use-produtos.ts`
- [ ] Criar `hooks/use-categorias.ts`
- [ ] Remover lógica duplicada de fetch
- [ ] Testar todos os hooks
- [ ] Documentar padrão

---

## Validação

- [ ] Todos os hooks seguem mesma interface
- [ ] Componentes usam hooks
- [ ] Sem lógica de fetch duplicada
- [ ] Testes passam

---

**Última Atualização:** 18/11/2025
