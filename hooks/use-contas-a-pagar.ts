import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import type { 
  ContaPagar, 
  ContaPagarFilters, 
  RelatorioMensalContasPagar,
  ContaPagarInput,
  ContaPagarUpdate,
  MarcarComoPagaInput
} from '@/shared/types'

interface UseContasPagarReturn {
  contas: ContaPagar[]
  relatorio: RelatorioMensalContasPagar | null
  loading: boolean
  isLoadingRelatorio: boolean
  error: string | null
  carregarContas: (filters?: ContaPagarFilters) => Promise<void>
  carregarRelatorio: (mes: number, ano: number) => Promise<void>
  criarConta: (data: ContaPagarInput) => Promise<ContaPagar>
  atualizarConta: (data: ContaPagarUpdate) => Promise<ContaPagar>
  marcarComoPaga: (data: MarcarComoPagaInput) => Promise<ContaPagar>
  deletarConta: (id: string) => Promise<void>
}

export function useContasPagar(): UseContasPagarReturn {
  const { toast } = useToast()
  const [contas, setContas] = useState<ContaPagar[]>([])
  const [relatorio, setRelatorio] = useState<RelatorioMensalContasPagar | null>(null)
  const [loading, setLoading] = useState(false)
  const [isLoadingRelatorio, setIsLoadingRelatorio] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingContas, setIsLoadingContas] = useState(false)

  const handleError = (error: any, message: string) => {
    console.error(message, error)
    const errorMessage = error.message || message
    setError(errorMessage)
    toast({
      title: "Erro",
      description: errorMessage,
      variant: "destructive",
    })
  }

  const carregarContas = async (filters: ContaPagarFilters = {}) => {
    if (isLoadingContas) return
    
    try {
      setIsLoadingContas(true)
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: (filters.page || 1).toString(),
        limit: (filters.limit || 100).toString(),
        ...(filters.status && filters.status !== "all" && { status: filters.status }),
        ...(filters.categoria && { categoria: filters.categoria }),
        ...(filters.recorrencia && { recorrencia: filters.recorrencia }),
        ...(filters.data_inicio && { data_inicio: filters.data_inicio }),
        ...(filters.data_fim && { data_fim: filters.data_fim }),
        ...(filters.orderBy && { orderBy: filters.orderBy }),
        ...(filters.order && { order: filters.order }),
      })

      const response = await fetch(`/api/v1/contas-a-pagar?${params}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar contas a pagar')
      }

      const data = await response.json()
      setContas(data.contas || [])
    } catch (error: any) {
      handleError(error, 'Erro ao carregar contas a pagar')
    } finally {
      setLoading(false)
      setIsLoadingContas(false)
    }
  }

  const carregarRelatorio = async (mes: number, ano: number) => {
    if (isLoadingRelatorio) return
    
    try {
      setIsLoadingRelatorio(true)
      setError(null)

      // Validar se a data não é muito futura
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
      const currentMonth = currentDate.getMonth() + 1
      
      if (ano > currentYear + 1 || (ano === currentYear + 1 && mes > currentMonth)) {
        console.warn('Data muito futura, ignorando requisição de relatório')
        return
      }

      const response = await fetch(`/api/v1/contas-a-pagar/relatorio?mes=${mes}&ano=${ano}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar relatório')
      }

      const data = await response.json()
      setRelatorio(data)
    } catch (error: any) {
      handleError(error, 'Erro ao carregar relatório')
    } finally {
      setIsLoadingRelatorio(false)
    }
  }

  const criarConta = async (data: ContaPagarInput): Promise<ContaPagar> => {
    try {
      setError(null)

      const response = await fetch('/api/v1/contas-a-pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao criar conta')
      }

      const conta = await response.json()
      
      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso",
      })

      return conta
    } catch (error: any) {
      handleError(error, 'Erro ao criar conta')
      throw error
    }
  }

  const atualizarConta = async (data: ContaPagarUpdate): Promise<ContaPagar> => {
    try {
      setError(null)

      const { id, ...updateData } = data
      const response = await fetch(`/api/v1/contas-a-pagar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao atualizar conta')
      }

      const conta = await response.json()
      
      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso",
      })

      return conta
    } catch (error: any) {
      handleError(error, 'Erro ao atualizar conta')
      throw error
    }
  }

  const marcarComoPaga = async (data: MarcarComoPagaInput): Promise<ContaPagar> => {
    try {
      setError(null)

      const response = await fetch(`/api/v1/contas-a-pagar/${data.id}/marcar-paga`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data_pagamento: data.data_pagamento || new Date().toISOString() 
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao marcar conta como paga')
      }

      const conta = await response.json()
      
      toast({
        title: "Sucesso",
        description: "Conta marcada como paga",
      })

      return conta
    } catch (error: any) {
      handleError(error, 'Erro ao marcar conta como paga')
      throw error
    }
  }

  const deletarConta = async (id: string): Promise<void> => {
    try {
      setError(null)

      const response = await fetch(`/api/v1/contas-a-pagar/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao deletar conta')
      }

      toast({
        title: "Sucesso",
        description: "Conta deletada com sucesso",
      })
    } catch (error: any) {
      handleError(error, 'Erro ao deletar conta')
      throw error
    }
  }

  return {
    contas,
    relatorio,
    loading,
    isLoadingRelatorio,
    error,
    carregarContas,
    carregarRelatorio,
    criarConta,
    atualizarConta,
    marcarComoPaga,
    deletarConta,
  }
}