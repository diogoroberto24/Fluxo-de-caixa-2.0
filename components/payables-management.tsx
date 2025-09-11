"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Check } from "lucide-react"
import { ExpenseModal } from "@/components/expense-modal"

const mockPayables = [
  {
    id: 1,
    description: "Aluguel do escritório",
    value: "R$ 3.500,00",
    dueDate: "05/01/2025",
    category: "Infraestrutura",
    recurrence: "Mensal",
    status: "Pendente",
  },
  {
    id: 2,
    description: "Software de contabilidade",
    value: "R$ 450,00",
    dueDate: "15/01/2025",
    category: "Tecnologia",
    recurrence: "Mensal",
    status: "Pendente",
  },
  {
    id: 3,
    description: "Energia elétrica",
    value: "R$ 280,00",
    dueDate: "20/12/2024",
    category: "Utilidades",
    recurrence: "Mensal",
    status: "Pago",
  },
  {
    id: 4,
    description: "Material de escritório",
    value: "R$ 150,00",
    dueDate: "30/12/2024",
    category: "Suprimentos",
    recurrence: "Eventual",
    status: "Vencido",
  },
]

export function PayablesManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false)

  const filteredPayables = mockPayables.filter(
    (payable) =>
      payable.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payable.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contas a Pagar</h1>
          <p className="text-muted-foreground mt-1">Gerencie todas as despesas e contas da empresa</p>
        </div>
        <Button onClick={() => setIsExpenseModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payables Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lista de Contas a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayables.map((payable) => (
                <TableRow key={payable.id}>
                  <TableCell className="font-medium">{payable.description}</TableCell>
                  <TableCell>{payable.value}</TableCell>
                  <TableCell>{payable.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payable.category}</Badge>
                  </TableCell>
                  <TableCell>{payable.recurrence}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payable.status === "Pago"
                          ? "default"
                          : payable.status === "Pendente"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {payable.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Check className="h-4 w-4" />
                      </Button>
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

      <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
    </div>
  )
}
