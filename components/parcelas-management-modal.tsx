"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedParcela, setSelectedParcela] = useState<Parcela | null>(null)
  const [paymentData, setPaymentData] = useState({
    data_de_pagamento: new Date().toISOString().split('T')[0],
    metodo_de_pagamento: "",
    observacoes: ""
  })

  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && client) {
      fetchParcelas()
    }
  }, [isOpen, client])

  const fetchParcelas = async () => {
    if (!client) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/eventual-clients/${client.id}/parcelas`)
      if (!response.ok) throw new Error('Falha ao buscar parcelas')
      
      const data = await response.json()
      setParcelas(data)
    } catch (error) {
      toast({
        title: "Erro ao carregar parcelas",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmPayment = (parcela: Parcela) => {
    setSelectedParcela(parcela)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSubmit = async () => {
    if (!selectedParcela || !client) return

    try {
      // 1. Atualizar status da cobrança para 'pago'
      const cobrancaResponse = await fetch(`/api/cobrancas/${selectedParcela.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'pago',
          data_de_pagamento: paymentData.data_de_pagamento,
          metodo_de_pagamento: paymentData.metodo_de_pagamento,
          observacoes: paymentData.observacoes
        })
      })

      if (!cobrancaResponse.ok) throw new Error('Falha ao atualizar cobrança')

      // 2. Buscar o lançamento no balanço associado a esta cobrança
      const balancoResponse = await fetch(`/api/balancos?cobranca_id=${selectedParcela.id}`)
      if (!balancoResponse.ok) throw new Error('Falha ao buscar lançamento no balanço')
      
      const balancosData = await balancoResponse.json()
      
      // Buscar especificamente o registro com status 'previsto' para esta cobrança
      const balancoExistente = balancosData.find((b: any) => 
        b.cobranca_id === selectedParcela.id && 
        b.status === 'previsto' &&
        b.tipo === 'ENTRADA'
      )

      if (balancoExistente) {
        // 3. Atualizar o lançamento existente no balanço de 'previsto' para 'confirmado'
        const updateBalancoResponse = await fetch(`/api/balancos/${balancoExistente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'confirmado',
            data_de_fato: paymentData.data_de_pagamento,
            descricao: `Pagamento de parcela confirmado - ${client?.nome}`,
            metadata: { 
              categoria: 'Serviços', 
              cliente_eventual: true,
              tipo_faturamento: 'confirmado',
              data_confirmacao: new Date().toISOString()
            }
          })
        })

        if (!updateBalancoResponse.ok) {
          const errorData = await updateBalancoResponse.json()
          throw new Error(`Falha ao atualizar lançamento no balanço: ${errorData.message || 'Erro desconhecido'}`)
        }

        console.log('✅ Registro no balanço atualizado com sucesso:', balancoExistente.id)
      } else {
        // Se não encontrar o lançamento previsto, criar um novo (fallback)
        console.warn('⚠️ Registro previsto não encontrado no balanço. Criando novo registro.')
        
        const balancoPayload = {
          tipo: "ENTRADA",
          valor: selectedParcela.total, // Valor já está em centavos
          descricao: `Pagamento de parcela (fallback) - ${client?.nome}`,
          status: "confirmado",
          data_de_fato: paymentData.data_de_pagamento,
          cobranca_id: selectedParcela.id,
          metadata: { 
            categoria: 'Serviços', 
            cliente_eventual: true,
            tipo_faturamento: 'fallback',
            data_confirmacao: new Date().toISOString()
          }
        }

        const createBalancoResponse = await fetch('/api/balancos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(balancoPayload)
        })

        if (!createBalancoResponse.ok) {
          const errorData = await createBalancoResponse.json()
          throw new Error(`Falha ao registrar no balanço: ${errorData.message || 'Erro desconhecido'}`)
        }

        console.log('✅ Novo registro criado no balanço (fallback)')
      }

      toast({
        title: "Pagamento confirmado!",
        description: "A parcela foi marcada como paga e o balanço foi atualizado.",
        variant: "default"
      })

      // Fechar modal de pagamento e recarregar parcelas
      setIsPaymentModalOpen(false)
      setPaymentData({
        data_de_pagamento: "",
        metodo_de_pagamento: "",
        observacoes: ""
      })
      fetchParcelas()

    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error)
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
            <DialogDescription>
              Visualize e gerencie as parcelas do cliente eventual, confirmando pagamentos e atualizando status.
            </DialogDescription>
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
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Parcelamento</p>
                    <p className="text-sm font-medium">{client.parcelamento === 'ENTRADA_PARCELAS' ? 'Entrada + Parcelas' : client.parcelamento}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela de Parcelas */}
            <div className="flex-1 min-h-0">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-shrink-0 pb-3">
                  <CardTitle className="text-lg">Parcelas</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {parcelas.length} parcela(s) encontrada(s)
                  </p>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 p-0">
                  <div className="overflow-auto h-full">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead className="text-xs">Parcela</TableHead>
                          <TableHead className="text-xs">Valor</TableHead>
                          <TableHead className="text-xs">Vencimento</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Pagamento</TableHead>
                          <TableHead className="text-xs">Método</TableHead>
                          <TableHead className="text-xs">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              Carregando parcelas...
                            </TableCell>
                          </TableRow>
                        ) : parcelas.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Nenhuma parcela encontrada
                            </TableCell>
                          </TableRow>
                        ) : (
                          parcelas.map((parcela, index) => (
                            <TableRow key={parcela.id} className="text-xs">
                              <TableCell className="font-medium">
                                {index + 1}ª Parcela
                              </TableCell>
                              <TableCell>{formatCurrency(parcela.total)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(parcela.data_de_vencimento)}
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(parcela.status)}</TableCell>
                              <TableCell>
                                {parcela.data_de_pagamento ? formatDate(parcela.data_de_pagamento) : '-'}
                              </TableCell>
                              <TableCell>
                                {parcela.metodo_de_pagamento || '-'}
                              </TableCell>
                              <TableCell>
                                {parcela.status === 'pendente' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7"
                                    onClick={() => handleConfirmPayment(parcela)}
                                  >
                                    Confirmar Pagamento
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Pagamento */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento</DialogTitle>
            <DialogDescription>
              Confirme os detalhes do pagamento da parcela selecionada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="data_pagamento">Data do Pagamento</Label>
              <Input
                id="data_pagamento"
                type="date"
                value={paymentData.data_de_pagamento}
                onChange={(e) => setPaymentData({ ...paymentData, data_de_pagamento: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="metodo_pagamento">Método de Pagamento</Label>
              <Select
                value={paymentData.metodo_de_pagamento}
                onValueChange={(value) => setPaymentData({ ...paymentData, metodo_de_pagamento: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Observações sobre o pagamento..."
                value={paymentData.observacoes}
                onChange={(e) => setPaymentData({ ...paymentData, observacoes: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePaymentSubmit}>
              Confirmar Pagamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}