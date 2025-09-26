"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, CreditCard, CheckCircle, Clock, X, User, Phone, FileText, DollarSign } from "lucide-react"

interface Parcela {
  id: string
  subtotal: number
  total: number
  status: string
  data_de_vencimento: string
  data_de_pagamento?: string
  metodo_de_pagamento?: string
  observacoes?: string
}

interface EventualClient {
  id: string
  nome: string
  documento: string
  telefone: string
  email: string
  valor_servico: number
  parcelamento: string
}

interface ParcelasManagementModalProps {
  isOpen: boolean
  onClose: () => void
  client: EventualClient | null
}

export function ParcelasManagementModal({ isOpen, onClose, client }: ParcelasManagementModalProps) {
  const { toast } = useToast()
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentData, setPaymentData] = useState({
    data_de_pagamento: new Date().toISOString().split('T')[0],
    metodo_de_pagamento: "",
    observacoes: ""
  })

  // Buscar parcelas do cliente
  useEffect(() => {
    if (isOpen && client) {
      fetchParcelas()
    }
  }, [isOpen, client])

  const fetchParcelas = async () => {
    if (!client) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/cobrancas?cliente_eventual_id=${client.id}`)
      if (response.ok) {
        const cobrancas = await response.json()
        setParcelas(cobrancas)
      }
    } catch (error) {
      console.error("Erro ao buscar parcelas:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as parcelas",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async () => {
    if (!selectedParcela) return

    try {
      // 1. Atualizar a cobrança
      const cobrancaResponse = await fetch(`/api/cobrancas/${selectedParcela.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pago',
          data_de_pagamento: new Date(paymentData.data_de_pagamento),
          metodo_de_pagamento: paymentData.metodo_de_pagamento,
          observacoes: paymentData.observacoes
        })
      })

      if (!cobrancaResponse.ok) throw new Error('Falha ao atualizar cobrança')

      // 2. Criar lançamento no balanço
      const balancoPayload = {
        tipo: "ENTRADA",
        valor: selectedParcela.total / 100, // Converter de centavos para reais
        descricao: `Pagamento de parcela - ${client?.nome}`,
        status: "confirmado",
        data_de_fato: new Date(paymentData.data_de_pagamento),
        cobranca_id: selectedParcela.id,
        metadata: { categoria: 'Serviços', cliente_eventual: true }
      }

      const balancoResponse = await fetch('/api/balancos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(balancoPayload)
      })

      if (!balancoResponse.ok) throw new Error('Falha ao registrar no balanço')

      toast({
        title: "Pagamento confirmado!",
        description: "A parcela foi marcada como paga e registrada no balanço.",
      })

      // Atualizar a lista de parcelas
      fetchParcelas()
      setIsPaymentModalOpen(false)
      setSelectedParcela(null)
      setPaymentData({
        data_de_pagamento: new Date().toISOString().split('T')[0],
        metodo_de_pagamento: "",
        observacoes: ""
      })

    } catch (error) {
      toast({
        title: "Erro ao confirmar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge variant="default" className="bg-green-500 text-xs"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>
      case 'pendente':
        return <Badge variant="secondary" className="text-xs"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
      case 'cancelado':
        return <Badge variant="destructive" className="text-xs"><X className="w-3 h-3 mr-1" />Cancelado</Badge>
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return `R$ ${(value / 100).toFixed(2).replace('.', ',')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  if (!client) return null

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!max-w-[60vw] !w-[60vw] h-[70vh] flex flex-col">
          <DialogHeader className="flex-shrink-0 pb-2">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="w-5 h-5" />
              Gerenciar Parcelas - {client.nome}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Informações do Cliente - Layout Compacto */}
            <div className="flex-shrink-0 bg-muted/30 rounded-lg p-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Documento</p>
                    <p className="text-sm font-medium">{client.documento}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="text-sm font-medium">{client.telefone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Valor Total</p>
                    <p className="text-sm font-medium">{formatCurrency(client.valor_servico)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Parcelamento</p>
                    <p className="text-sm font-medium">
                      {client.parcelamento === 'AVISTA' ? 'À Vista' : 
                       client.parcelamento === 'PARCELADO' ? 'Parcelado' : 
                       'Entrada + Parcelas'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Parcelas - Tabela Otimizada */}
            <div className="flex-1 min-h-0 bg-background rounded-lg border overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold">Parcelas</h3>
                <p className="text-sm text-muted-foreground">
                  {parcelas.length} parcela(s) encontrada(s)
                </p>
              </div>
              
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Carregando parcelas...</p>
                    </div>
                  </div>
                ) : parcelas.length === 0 ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">Nenhuma parcela encontrada para este cliente.</p>
                    </div>
                  </div>
                ) : (
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Parcela</TableHead>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Valor</TableHead>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Vencimento</TableHead>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Status</TableHead>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Pagamento</TableHead>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Método</TableHead>
                        <TableHead className="min-w-[80px] whitespace-nowrap">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parcelas.map((parcela, index) => (
                        <TableRow key={parcela.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-sm whitespace-nowrap">
                            {index + 1}ª Parcela
                          </TableCell>
                          <TableCell className="text-sm font-medium whitespace-nowrap">
                            {formatCurrency(parcela.total)}
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {formatDate(parcela.data_de_vencimento)}
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{getStatusBadge(parcela.status)}</TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {parcela.data_de_pagamento ? 
                              formatDate(parcela.data_de_pagamento) : 
                              <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {parcela.metodo_de_pagamento || <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {parcela.status === 'pendente' && (
                              <Button
                                size="sm"
                                className="h-8 text-xs px-3"
                                onClick={() => {
                                  setSelectedParcela(parcela)
                                  setIsPaymentModalOpen(true)
                                }}
                              >
                                Confirmar Pagamento
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Pagamento - Compacto */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg">Confirmar Pagamento</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {selectedParcela && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Valor:</span>
                  <span className="text-lg font-bold">{formatCurrency(selectedParcela.total)}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-muted-foreground">Vencimento:</span>
                  <span className="text-xs text-muted-foreground">{formatDate(selectedParcela.data_de_vencimento)}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="data_pagamento" className="text-sm">Data do Pagamento</Label>
                <Input
                  id="data_pagamento"
                  type="date"
                  value={paymentData.data_de_pagamento}
                  onChange={(e) => setPaymentData(prev => ({ 
                    ...prev, 
                    data_de_pagamento: e.target.value 
                  }))}
                  className="h-9"
                  required
                />
              </div>

              <div>
                <Label htmlFor="metodo_pagamento" className="text-sm">Método</Label>
                <Select
                  value={paymentData.metodo_de_pagamento}
                  onValueChange={(value) => setPaymentData(prev => ({ 
                    ...prev, 
                    metodo_de_pagamento: value 
                  }))}
                  required
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Selecione" />
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
            </div>

            <div>
              <Label htmlFor="observacoes" className="text-sm">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={paymentData.observacoes}
                onChange={(e) => setPaymentData(prev => ({ 
                  ...prev, 
                  observacoes: e.target.value 
                }))}
                placeholder="Observações sobre o pagamento..."
                className="h-20 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 h-9"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmPayment}
                className="flex-1 h-9"
                disabled={!paymentData.metodo_de_pagamento}
              >
                Confirmar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}