"use client"

import { useState } from "react"
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
  const [searchTerm, setSearchTerm] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [receivables, setReceivables] = useState(mockReceivables)
  const [editingReceivable, setEditingReceivable] = useState<(typeof mockReceivables)[0] | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [receivableToDelete, setReceivableToDelete] = useState<number | null>(null)

  const handleEditReceivable = (receivable: (typeof mockReceivables)[0]) => {
    setEditingReceivable(receivable)
    setIsPaymentModalOpen(true)
  }

  const handleDeleteReceivable = (id: number) => {
    setReceivableToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (receivableToDelete) {
      setReceivables(receivables.filter((r) => r.id !== receivableToDelete))
      setReceivableToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleModalClose = () => {
    setIsPaymentModalOpen(false)
    setEditingReceivable(null)
  }

  const filteredReceivables = receivables.filter((receivable) =>
    receivable.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Recebimentos</h1>
          <p className="text-muted-foreground mt-1">Acompanhe todos os pagamentos e recebimentos</p>
        </div>
        <Button onClick={() => setIsPaymentModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReceivables.map((receivable) => (
                <TableRow key={receivable.id}>
                  <TableCell className="font-medium">{receivable.id}</TableCell>
                  <TableCell>{receivable.client}</TableCell>
                  <TableCell>{receivable.value}</TableCell>
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
                      <Button variant="ghost" size="sm" onClick={() => handleEditReceivable(receivable)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteReceivable(receivable.id)}>
                        <Trash2 className="h-4 w-4" />
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
        onClose={handleModalClose}
        isEditMode={!!editingReceivable}
        receivableData={editingReceivable}
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
