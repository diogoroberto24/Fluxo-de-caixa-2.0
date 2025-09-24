"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { MetodoPagamentoEnum, StatusCobranca } from "@/shared/validation/cobrancas"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientName: string
  isEditMode?: boolean
  cobrancaId?: string
}

export function PaymentModal({ isOpen, onClose, clientId, clientName, isEditMode = false, cobrancaId }: PaymentModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    valor_pago: "",
    data_de_pagamento: "",
    data_de_vencimento: "",
    metodo_de_pagamento: "",
    observacoes: "",
  })
  const [clientModules, setClientModules] = useState<any[]>([])
  const [selectedModules, setSelectedModules] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Buscar os módulos contratados pelo cliente
  useEffect(() => {
    if (isOpen && clientId) {
      const fetchClientModules = async () => {
        try {
          const response = await fetch(`/api/clients/${clientId}`)
          if (!response.ok) throw new Error('Falha ao buscar dados do cliente')
          
          const clientData = await response.json()
          if (clientData.produtos && Array.isArray(clientData.produtos)) {
            setClientModules(clientData.produtos)
            // Selecionar todos os módulos por padrão
            setSelectedModules(clientData.produtos.map((p: any) => p.produto_id))
          }
        } catch (error) {
          console.error('Erro ao buscar módulos do cliente:', error)
        }
      }
      
      fetchClientModules()
    }
  }, [isOpen, clientId])

  useEffect(() => {
    if (isOpen && !isEditMode) {
      // Reset form when opening in create mode
      const today = new Date()
      const nextMonth = new Date(today)
      nextMonth.setMonth(today.getMonth() + 1)
      
      setFormData({
        valor_pago: "",
        data_de_pagamento: today.toISOString().split('T')[0],
        data_de_vencimento: nextMonth.toISOString().split('T')[0],
        metodo_de_pagamento: "",
        observacoes: "",
      })
    }
  }, [isOpen, isEditMode])

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Obter o valor pago do formulário e converter para número
      const valorPago = parseFloat(formData.valor_pago.replace(/[^\d,]/g, '').replace(',', '.'))
      
      // 1. Criar os itens da cobrança baseados nos módulos selecionados
      const itens = selectedModules.map(moduleId => {
        const module = clientModules.find((m: any) => m.produto_id === moduleId)
        return {
          produto_id: moduleId,
          quantidade: 1,
          // Valor simbólico de 0 para não influenciar no total
          valor_unitario: 0,
          descricao: `Honorários - ${module?.nome || 'Serviço'}`,
          desconto: 0
        }
      })
      
      // 2. Criar a cobrança usando diretamente o valor pago como total e subtotal
      const cobrancaPayload = {
        cliente_id: clientId,
        data_de_vencimento: formData.data_de_vencimento,
        status: "pago" as StatusCobranca,
        metodo_de_pagamento: formData.metodo_de_pagamento,
        observacoes: formData.observacoes || null,
        desconto: 0,
        // Usar o valor pago diretamente como total e subtotal
        subtotal: valorPago,
        total: valorPago,
        itens: itens
      }
      
      // Criar a cobrança
      const cobrancaResponse = await fetch('/api/cobrancas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cobrancaPayload)
      })
      
      if (!cobrancaResponse.ok) throw new Error('Falha ao criar cobrança')
      
      const cobrancaData = await cobrancaResponse.json()
      
      // 3. Registrar o pagamento e criar o lançamento no balanço
      const balancoPayload = {
        tipo: "ENTRADA",
        valor: valorPago,
        descricao: `Pagamento de honorários - ${clientName}`,
        status: "confirmado",
        data_de_fato: new Date(formData.data_de_pagamento),
        cobranca_id: cobrancaData.id
      }
      
      // Criar o lançamento no balanço
      const balancoResponse = await fetch('/api/balancos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(balancoPayload)
      })
      
      if (!balancoResponse.ok) throw new Error('Falha ao registrar lançamento no balanço')
      
      toast({
        title: "Pagamento registrado com sucesso!",
        description: "O pagamento foi adicionado ao sistema e registrado no balanço.",
      })
      
      onClose()
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Pagamento" : "Registrar Pagamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <Input value={clientName} disabled className="bg-muted" />
            <input type="hidden" value={clientId} />
          </div>

          <div>
            <Label htmlFor="valor_pago">Valor Pago</Label>
            <Input
              id="valor_pago"
              type="text"
              placeholder="R$ 0,00"
              value={formData.valor_pago}
              onChange={(e) => setFormData((prev) => ({ ...prev, valor_pago: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data_de_pagamento">Data do Pagamento</Label>
              <Input
                id="data_de_pagamento"
                type="date"
                value={formData.data_de_pagamento}
                onChange={(e) => setFormData((prev) => ({ ...prev, data_de_pagamento: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="data_de_vencimento">Data de Vencimento</Label>
              <Input
                id="data_de_vencimento"
                type="date"
                value={formData.data_de_vencimento}
                onChange={(e) => setFormData((prev) => ({ ...prev, data_de_vencimento: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="metodo_de_pagamento">Método de Pagamento</Label>
            <Select
              value={formData.metodo_de_pagamento}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, metodo_de_pagamento: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="BOLETO">Boleto</SelectItem>
                <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Módulos Contratados (Apenas para referência)</Label>
            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
              {clientModules.length > 0 ? (
                clientModules.map((module: any) => (
                  <div key={module.produto_id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`module-${module.produto_id}`}
                      checked={selectedModules.includes(module.produto_id)}
                      onCheckedChange={() => handleModuleToggle(module.produto_id)}
                    />
                    <Label 
                      htmlFor={`module-${module.produto_id}`}
                      className="text-sm cursor-pointer"
                    >
                      {module.nome}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum módulo encontrado para este cliente.</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Processando..." : "Registrar Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
