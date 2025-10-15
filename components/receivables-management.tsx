"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Search, Edit, Trash2 } from "lucide-react"
import { PaymentModal } from "@/components/payment-modal"
import { formatMoney } from "@/shared/utils/money"
import { useToast } from "@/hooks/use-toast"

const mockReceivables = [
  {
    id: 1,
    client: "Empresa ABC Ltda",
    value: "R$ 2.500,00",
    date: "15/12/2024",
    method: "PIX",
    status: "Pago",
    observations: "Pagamento em dia",
  },
  {
    id: 2,
    client: "João Silva ME",
    value: "R$ 1.200,00",
    date: "20/12/2024",
    method: "Boleto",
    status: "Pendente",
    observations: "Aguardando vencimento",
  },
  {
    id: 3,
    client: "Comércio XYZ",
    value: "R$ 3.800,00",
    date: "10/12/2024",
    method: "Transferência",
    status: "Atrasado",
    observations: "Cliente contatado",
  },
  {
    id: 4,
    client: "Maria Santos",
    value: "R$ 950,00",
    date: "18/12/2024",
    method: "Cartão",
    status: "Pago",
    observations: "Pagamento antecipado",
  },
]

export function ReceivablesManagement() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedReceivableId, setSelectedReceivableId] = useState<string | null>(null)
  const [receivables, setReceivables] = useState<any[]>([])
  const [month, setMonth] = useState<string>(() => {
    const m = new Date().getMonth() + 1
    return m.toString().padStart(2, '0')
  })
  const [year, setYear] = useState<string>(() => new Date().getFullYear().toString())
  const [tipoCliente, setTipoCliente] = useState<string>("") // "" | "fixo" | "eventual"
  const [status, setStatus] = useState<string>("") // "" | "confirmado" | "previsto"
  const [isLoading, setIsLoading] = useState(false)

  // Buscar dados reais do balanço (recebimentos)
  const fetchReceivables = async () => {
    if (isLoading) {
      console.warn('Requisição de recebimentos já em andamento, ignorando nova requisição')
      return
    }

    // Validar se a data não é muito futura
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const requestYear = parseInt(year)
    const requestMonth = parseInt(month)
    
    if (requestYear > currentYear + 1 || (requestYear === currentYear + 1 && requestMonth > currentMonth)) {
      console.warn('Data muito futura, ignorando requisição de recebimentos')
      return
    }

    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.set('mes', month)
      params.set('ano', year)
      if (tipoCliente) params.set('tipo_cliente', tipoCliente)
      if (status) params.set('status', status)

      const res = await fetch(`/api/balancos?${params.toString()}`)
      if (!res.ok) {
        console.error('Falha ao carregar recebimentos')
        return
      }
    const data = await res.json()

    const mapped = data.map((b: any) => {
      const clienteNome = b.cobranca?.cliente?.nome || b.cobranca?.cliente_eventual?.nome || '—'
      const tipo = b.cobranca?.cliente_id ? 'Fixo' : b.cobranca?.cliente_eventual_id ? 'Eventual' : '—'
      const metodo = b.cobranca?.metodo_de_pagamento || '—'
      const dataRecebimento = b.data_de_fato ? new Date(b.data_de_fato) : null
      const dataFmt = dataRecebimento
        ? dataRecebimento.toLocaleDateString('pt-BR')
        : '—'

      return {
        id: b.id,
        client: clienteNome,
        value: formatMoney(b.valor || 0),
        date: dataFmt,
        method: metodo,
        status: b.status === 'confirmado' ? 'Pago' : b.status === 'previsto' ? 'Pendente' : b.status,
        observations: b.descricao || '',
        tipo,
      }
    })

    setReceivables(mapped)
    } catch (error) {
      console.error('Erro ao carregar recebimentos:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReceivables()
  }, [month, year, tipoCliente, status])

  const filteredReceivables = useMemo(() => {
    return receivables.filter((r) =>
      r.client.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [receivables, searchTerm])

  const handleDeleteClick = (receivableId: string) => {
    setSelectedReceivableId(receivableId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedReceivableId) return
    
    try {
      const response = await fetch(`/api/balancos/${selectedReceivableId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Falha ao excluir recebimento')
      }

      toast({
        title: "Sucesso",
        description: "Recebimento excluído com sucesso!",
      })

      // Fechar o dialog e limpar a seleção
      setIsDeleteDialogOpen(false)
      setSelectedReceivableId(null)
      
      // Recarregar os dados
      await fetchReceivables()
    } catch (error) {
      console.error('Erro ao excluir recebimento:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir recebimento. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Recebimentos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe todos os pagamentos e recebimentos</p>
        </div>
        <Button onClick={() => setIsPaymentModalOpen(true)} className="gap-2">
          Novo Pagamento
        </Button>
      </div>

      {/* Filtros + Busca */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Mês</label>
              <Input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="MM" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Ano</label>
              <Input value={year} onChange={(e) => setYear(e.target.value)} placeholder="YYYY" />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Tipo de cliente</label>
              <select
                className="w-full h-10 border rounded-md px-2 bg-background text-foreground"
                value={tipoCliente}
                onChange={(e) => setTipoCliente(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="fixo">Fixo</option>
                <option value="eventual">Eventual</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Status</label>
              <select
                className="w-full h-10 border rounded-md px-2 bg-background text-foreground"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="confirmado">Recebido</option>
                <option value="previsto">Pendente</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Input
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receivables Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lista de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Data de recebimento</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell>{receivable.client}</TableCell>
                  <TableCell>{receivable.value}</TableCell>
                  <TableCell>{receivable.tipo}</TableCell>
                  <TableCell>{receivable.date}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{receivable.method}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        receivable.status === "Pago"
                          ? "default"
                          : receivable.status === "Pendente"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {receivable.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{receivable.observations}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsPaymentModalOpen(true)}>
                        Editar
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteClick(receivable.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        isEditMode={false}
        clientId={""}
        clientName={""}
        cobrancaId={""}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este recebimento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
