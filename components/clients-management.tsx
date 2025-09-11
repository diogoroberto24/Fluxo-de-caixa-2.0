"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Eye, Edit, DollarSign, UserX, Users } from "lucide-react"
import { ClientModal } from "@/components/client-modal"
import { PaymentModal } from "@/components/payment-modal"

const mockClients = [
  {
    id: 1,
    name: "Empresa ABC Ltda",
    document: "12.345.678/0001-90",
    modules: ["Contábil", "Fiscal"],
    fees: "R$ 2.500,00",
    status: "Ativo",
  },
  {
    id: 2,
    name: "João Silva ME",
    document: "123.456.789-00",
    modules: ["Contábil"],
    fees: "R$ 1.200,00",
    status: "Ativo",
  },
  {
    id: 3,
    name: "Comércio XYZ",
    document: "98.765.432/0001-10",
    modules: ["Contábil", "Fiscal", "Trabalhista"],
    fees: "R$ 3.800,00",
    status: "Inadimplente",
  },
  {
    id: 4,
    name: "Maria Santos",
    document: "987.654.321-00",
    modules: ["Contábil"],
    fees: "R$ 950,00",
    status: "Ativo",
  },
]

export function ClientsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)

  const filteredClients = mockClients.filter(
    (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.document.includes(searchTerm),
  )

  const handleRegisterPayment = (client: any) => {
    setSelectedClient(client)
    setIsPaymentModalOpen(true)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus clientes e acompanhe seus contratos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Users className="h-4 w-4" />
            Clientes Inativos
          </Button>
          <Button onClick={() => setIsClientModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome/Razão Social</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead>Módulos</TableHead>
                <TableHead>Honorários</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.document}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.modules.map((module, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{client.fees}</TableCell>
                  <TableCell>
                    <Badge variant={client.status === "Ativo" ? "default" : "destructive"}>{client.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRegisterPayment(client)}>
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} client={selectedClient} />
    </div>
  )
}
