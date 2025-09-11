"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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

  const filteredReceivables = mockReceivables.filter((receivable) =>
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
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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

      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} />
    </div>
  )
}
