"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"

interface ParcelaData {
  valor: number
  data_vencimento: string
}

interface EventualClient {
  id?: string
  nome: string
  documento: string
  telefone: string
  email: string
  valor_servico: number
  parcelamento: string
  observacoes?: string
  // Novos campos para parcelamento
  valor_entrada?: number
  quantidade_parcelas?: number
  valor_parcelas?: number // Novo campo adicionado
  parcelas?: ParcelaData[]
}

interface EventualClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (client: EventualClient) => void
  client?: EventualClient | null
  isEditMode?: boolean
}

export function EventualClientModal({
  isOpen,
  onClose,
  onSave,
  client,
  isEditMode = false
}: EventualClientModalProps) {
  const [formData, setFormData] = useState<EventualClient>({
    nome: "",
    documento: "",
    telefone: "",
    email: "",
    valor_servico: 0,
    parcelamento: "AVISTA",
    observacoes: "",
    valor_entrada: 0,
    quantidade_parcelas: 1,
    valor_parcelas: 0, // Novo campo adicionado
    parcelas: []
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (client && isEditMode) {
      setFormData({
        ...client,
        valor_servico: client.valor_servico / 100, // Converter de centavos para reais
        valor_entrada: client.valor_entrada ? client.valor_entrada / 100 : 0,
        valor_parcelas: client.valor_parcelas ? client.valor_parcelas / 100 : 0, // Novo campo
        parcelas: client.parcelas?.map(p => ({
          ...p,
          valor: p.valor / 100
        })) || []
      })
    } else {
      resetForm()
    }
  }, [client, isEditMode, isOpen])

  const resetForm = () => {
    setFormData({
      nome: "",
      documento: "",
      telefone: "",
      email: "",
      valor_servico: 0,
      parcelamento: "AVISTA",
      observacoes: "",
      valor_entrada: 0,
      quantidade_parcelas: 1,
      valor_parcelas: 0, // Novo campo adicionado
      parcelas: []
    })
  }

  // Calcular valor total automaticamente
  useEffect(() => {
    let valorTotal = 0

    switch (formData.parcelamento) {
      case "AVISTA":
        // Valor já está definido no campo valor_servico
        break
      case "PARCELADO":
        valorTotal = (formData.parcelas || []).reduce((sum, parcela) => sum + parcela.valor, 0)
        if (valorTotal > 0) {
          setFormData(prev => ({ ...prev, valor_servico: valorTotal }))
        }
        break
      case "ENTRADA_PARCELAS":
        valorTotal = (formData.valor_entrada || 0) + (formData.parcelas || []).reduce((sum, parcela) => sum + parcela.valor, 0)
        if (valorTotal > 0) {
          setFormData(prev => ({ ...prev, valor_servico: valorTotal }))
        }
        break
    }
  }, [formData.parcelas, formData.valor_entrada, formData.parcelamento])

  const handleParcelamentoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      parcelamento: value,
      valor_entrada: 0,
      quantidade_parcelas: 1,
      parcelas: []
    }))
  }

  const generateParcelas = () => {
    if (formData.parcelamento === "PARCELADO" && formData.quantidade_parcelas) {
      const valorPorParcela = formData.valor_servico / formData.quantidade_parcelas
      const novasParcelas: ParcelaData[] = []
      
      for (let i = 0; i < formData.quantidade_parcelas; i++) {
        const dataVencimento = new Date()
        dataVencimento.setMonth(dataVencimento.getMonth() + i)
        
        novasParcelas.push({
          valor: Number(valorPorParcela.toFixed(2)),
          data_vencimento: dataVencimento.toISOString().split('T')[0]
        })
      }
      
      setFormData(prev => ({ ...prev, parcelas: novasParcelas }))
    }
  }

  const addParcela = () => {
    const novaParcela: ParcelaData = {
      valor: 0,
      data_vencimento: new Date().toISOString().split('T')[0]
    }
    setFormData(prev => ({
      ...prev,
      parcelas: [...(prev.parcelas || []), novaParcela]
    }))
  }

  const removeParcela = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parcelas: (prev.parcelas || []).filter((_, i) => i !== index)
    }))
  }

  const updateParcela = (index: number, field: keyof ParcelaData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      parcelas: (prev.parcelas || []).map((parcela, i) => 
        i === index ? { ...parcela, [field]: value } : parcela
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clientData = {
        ...formData,
        valor_servico: Math.round(formData.valor_servico * 100), // Converter para centavos
        valor_entrada: formData.valor_entrada ? Math.round(formData.valor_entrada * 100) : undefined,
        valor_parcelas: formData.valor_parcelas ? Math.round(formData.valor_parcelas * 100) : undefined, // Novo campo
        parcelas: (formData.parcelas || []).map(p => ({
          ...p,
          valor: Math.round(p.valor * 100)
        }))
      }

      if (isEditMode && client?.id) {
        clientData.id = client.id
      }

      onSave(clientData)
      onClose()
    } catch (error) {
      console.error("Erro ao salvar cliente eventual:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito ou ponto decimal
    const numericValue = value.replace(/[^\d.]/g, "")
    
    // Se já tem ponto decimal, não processa como centavos
    if (numericValue.includes('.')) {
      const parts = numericValue.split('.')
      if (parts.length === 2 && parts[1].length <= 2) {
        return parseFloat(numericValue).toFixed(2)
      }
    }
    
    // Se não tem ponto decimal, trata como centavos
    const onlyDigits = numericValue.replace(/\D/g, "")
    if (onlyDigits.length === 0) return "0.00"
    
    const formattedValue = (parseInt(onlyDigits) / 100).toFixed(2)
    return formattedValue
  }

  const handleValueChange = (value: string) => {
    // Se o valor já está no formato correto (com ponto), usa diretamente
    if (value.includes('.') && /^\d+\.\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, valor_servico: parseFloat(value) || 0 }))
    } else {
      const formatted = formatCurrency(value)
      setFormData(prev => ({ ...prev, valor_servico: parseFloat(formatted) }))
    }
  }

  const handleEntradaChange = (value: string) => {
    // Se o valor já está no formato correto (com ponto), usa diretamente
    if (value.includes('.') && /^\d+\.\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, valor_entrada: parseFloat(value) || 0 }))
    } else {
      const formatted = formatCurrency(value)
      setFormData(prev => ({ ...prev, valor_entrada: parseFloat(formatted) }))
    }
  }

  // Nova função para lidar com mudanças no valor das parcelas
  const handleParcelasChange = (value: string) => {
    // Se o valor já está no formato correto (com ponto), usa diretamente
    if (value.includes('.') && /^\d+\.\d{0,2}$/.test(value)) {
      setFormData(prev => ({ ...prev, valor_parcelas: parseFloat(value) || 0 }))
    } else {
      const formatted = formatCurrency(value)
      setFormData(prev => ({ ...prev, valor_parcelas: parseFloat(formatted) }))
    }
  }

  // Nova função para gerar parcelas automaticamente
  const generateParcelasEntrada = () => {
    if (formData.parcelamento === "ENTRADA_PARCELAS" && formData.quantidade_parcelas && formData.valor_parcelas) {
      const novasParcelas: ParcelaData[] = []
      
      for (let i = 0; i < formData.quantidade_parcelas; i++) {
        const dataVencimento = new Date()
        dataVencimento.setMonth(dataVencimento.getMonth() + i + 1) // Primeira parcela no próximo mês
        
        novasParcelas.push({
          valor: formData.valor_parcelas,
          data_vencimento: dataVencimento.toISOString().split('T')[0]
        })
      }
      
      setFormData(prev => ({ ...prev, parcelas: novasParcelas }))
    }
  }

  const formatDocument = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    
    if (numericValue.length <= 11) {
      // CPF: 000.000.000-00
      return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    } else {
      // CNPJ: 00.000.000/0000-00
      return numericValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
    }
  }

  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, "")
    
    if (numericValue.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return numericValue.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    } else {
      // Celular: (00) 00000-0000
      return numericValue.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Cliente Eventual" : "Novo Cliente Eventual"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Básicos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Cliente *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Nome completo ou razão social"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">CPF/CNPJ *</Label>
                  <Input
                    id="documento"
                    value={formData.documento}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      documento: formatDocument(e.target.value) 
                    }))}
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      telefone: formatPhone(e.target.value) 
                    }))}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="cliente@email.com"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuração de Pagamento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcelamento">Opção de Parcelamento *</Label>
                  <Select
                    value={formData.parcelamento}
                    onValueChange={handleParcelamentoChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma opção" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVISTA">À Vista</SelectItem>
                      <SelectItem value="PARCELADO">Parcelado</SelectItem>
                      <SelectItem value="ENTRADA_PARCELAS">Entrada + Parcelas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_servico">Valor Total do Serviço *</Label>
                  <Input
                    id="valor_servico"
                    value={formData.valor_servico.toFixed(2)}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder="0,00"
                    required
                    disabled={formData.parcelamento !== "AVISTA"}
                  />
                </div>
              </div>

              {/* Campos específicos para PARCELADO */}
              {formData.parcelamento === "PARCELADO" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor_total_parcelado">Valor Total do Serviço *</Label>
                      <Input
                        id="valor_total_parcelado"
                        value={formData.valor_servico.toFixed(2)}
                        onChange={(e) => handleValueChange(e.target.value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantidade_parcelas">Quantidade de Parcelas *</Label>
                      <Input
                        id="quantidade_parcelas"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.quantidade_parcelas}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          quantidade_parcelas: parseInt(e.target.value) || 1 
                        }))}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={generateParcelas} className="w-full">
                        Gerar Parcelas
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Parcelas */}
                  {(formData.parcelas || []).length > 0 && (
                    <div className="space-y-2">
                      <Label>Parcelas Geradas</Label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(formData.parcelas || []).map((parcela, index) => (
                          <div key={index} className="flex gap-2 items-center p-2 border rounded">
                            <span className="text-sm font-medium w-16">#{index + 1}</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={parcela.valor}
                              onChange={(e) => updateParcela(index, 'valor', parseFloat(e.target.value) || 0)}
                              placeholder="Valor"
                              className="flex-1"
                            />
                            <Input
                              type="date"
                              value={parcela.data_vencimento}
                              onChange={(e) => updateParcela(index, 'data_vencimento', e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeParcela(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Campos específicos para ENTRADA + PARCELAS */}
              {formData.parcelamento === "ENTRADA_PARCELAS" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="valor_entrada">Valor da Entrada *</Label>
                      <Input
                        id="valor_entrada"
                        value={formData.valor_entrada?.toFixed(2) || "0.00"}
                        onChange={(e) => handleEntradaChange(e.target.value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valor_parcelas">Valor das Parcelas *</Label>
                      <Input
                        id="valor_parcelas"
                        value={formData.valor_parcelas?.toFixed(2) || "0.00"}
                        onChange={(e) => handleParcelasChange(e.target.value)}
                        placeholder="0,00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="quantidade_parcelas_entrada">Quantidade de Parcelas *</Label>
                      <Input
                        id="quantidade_parcelas_entrada"
                        type="number"
                        min="1"
                        max="12"
                        value={formData.quantidade_parcelas}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          quantidade_parcelas: parseInt(e.target.value) || 1 
                        }))}
                        required
                      />
                    </div>
                  </div>

                  {/* Botão Gerar Parcelas */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Parcelas</Label>
                      <Button type="button" variant="outline" size="sm" onClick={generateParcelasEntrada}>
                        <Plus className="h-4 w-4 mr-2" />
                        Gerar Parcelas
                      </Button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(formData.parcelas || []).map((parcela, index) => (
                        <div key={index} className="flex gap-2 items-center p-2 border rounded">
                          <span className="text-sm font-medium w-16">#{index + 1}</span>
                          <Input
                            type="number"
                            step="0.01"
                            value={parcela.valor}
                            onChange={(e) => updateParcela(index, 'valor', parseFloat(e.target.value) || 0)}
                            placeholder="Valor da parcela"
                            className="flex-1"
                          />
                          <Input
                            type="date"
                            value={parcela.data_vencimento}
                            onChange={(e) => updateParcela(index, 'data_vencimento', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeParcela(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Informações adicionais sobre o cliente ou serviço..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditMode ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}