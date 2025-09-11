"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Search, Eye, Edit, DollarSign, UserX, Users } from "lucide-react"
import { ClientModal } from "@/components/client-modal"
import { PaymentModal } from "@/components/payment-modal"

interface Client {
  id: string
  name: string
  cnpj: string
  modules: string[]
  fees: number
  status: "active" | "overdue" | "inactive"
  lastPayment: string
  phone: string
  email: string
  inactivationReason?: string
}

const mockClients: Client[] = [
  // Clientes em dia (47 total)
  {
    id: "001",
    name: "Empresa ABC Ltda",
    cnpj: "12.345.678/0001-90",
    modules: ["Contábil", "Fiscal"],
    fees: 2500,
    status: "active",
    lastPayment: "2024-01-15",
    phone: "(11) 99999-9999",
    email: "contato@empresaabc.com",
  },
  {
    id: "002",
    name: "Comércio XYZ ME",
    cnpj: "98.765.432/0001-10",
    modules: ["Contábil"],
    fees: 1200,
    status: "active",
    lastPayment: "2024-01-10",
    phone: "(11) 88888-8888",
    email: "financeiro@comercioxyz.com",
  },
  {
    id: "004",
    name: "Serviços GHI Ltda",
    cnpj: "55.666.777/0001-88",
    modules: ["Contábil", "Folha de Pagamento"],
    fees: 1800,
    status: "active",
    lastPayment: "2024-01-12",
    phone: "(11) 66666-6666",
    email: "rh@servicosghi.com",
  },
  {
    id: "006",
    name: "Tecnologia MNO S/A",
    cnpj: "22.333.444/0001-55",
    modules: ["Contábil", "Fiscal"],
    fees: 3200,
    status: "active",
    lastPayment: "2024-01-14",
    phone: "(11) 44444-4444",
    email: "ti@tecnologiamno.com",
  },
  {
    id: "007",
    name: "Alimentação PQR Ltda",
    cnpj: "33.444.555/0001-66",
    modules: ["Contábil"],
    fees: 1500,
    status: "active",
    lastPayment: "2024-01-13",
    phone: "(11) 33333-3333",
    email: "admin@alimentacaopqr.com",
  },
  // Gerando mais 42 clientes em dia para totalizar 47
  ...Array.from({ length: 42 }, (_, i) => ({
    id: `00${i + 8}`,
    name: `Cliente ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i + 1) % 26))}${String.fromCharCode(65 + ((i + 2) % 26))} ${i % 2 === 0 ? "Ltda" : "ME"}`,
    cnpj: `${String(10 + i).padStart(2, "0")}.${String(100 + i).padStart(3, "0")}.${String(200 + i).padStart(3, "0")}/0001-${String(10 + i).padStart(2, "0")}`,
    modules: i % 3 === 0 ? ["Contábil", "Fiscal"] : i % 3 === 1 ? ["Contábil"] : ["Contábil", "Folha de Pagamento"],
    fees: 800 + i * 100,
    status: "active" as const,
    lastPayment: `2024-01-${String(10 + (i % 20)).padStart(2, "0")}`,
    phone: `(11) ${String(90000 + i).padStart(5, "0")}-${String(1000 + i).padStart(4, "0")}`,
    email: `contato${i}@cliente${i}.com`,
  })),
  // Clientes inadimplentes (5 total)
  {
    id: "003",
    name: "Indústria DEF S/A",
    cnpj: "11.222.333/0001-44",
    modules: ["Contábil", "Fiscal", "Folha de Pagamento"],
    fees: 4500,
    status: "overdue",
    lastPayment: "2023-11-20",
    phone: "(11) 77777-7777",
    email: "admin@industriadef.com",
  },
  {
    id: "005",
    name: "Consultoria JKL ME",
    cnpj: "99.888.777/0001-66",
    modules: ["Contábil"],
    fees: 900,
    status: "overdue",
    lastPayment: "2023-12-05",
    phone: "(11) 55555-5555",
    email: "contato@consultoriajkl.com",
  },
  {
    id: "050",
    name: "Transportes STU Ltda",
    cnpj: "44.555.666/0001-77",
    modules: ["Contábil", "Fiscal"],
    fees: 2200,
    status: "overdue",
    lastPayment: "2023-10-15",
    phone: "(11) 22222-2222",
    email: "financeiro@transportesstu.com",
  },
  {
    id: "051",
    name: "Construção VWX S/A",
    cnpj: "66.777.888/0001-99",
    modules: ["Contábil", "Folha de Pagamento"],
    fees: 3800,
    status: "overdue",
    lastPayment: "2023-09-30",
    phone: "(11) 11111-1111",
    email: "obras@construcaovwx.com",
  },
  {
    id: "052",
    name: "Varejo YZA ME",
    cnpj: "77.888.999/0001-00",
    modules: ["Contábil"],
    fees: 1100,
    status: "overdue",
    lastPayment: "2023-11-10",
    phone: "(11) 00000-0000",
    email: "vendas@varejoyza.com",
  },
]

export function ClientsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false)
  const [clientToInactivate, setClientToInactivate] = useState<string | null>(null)
  const [inactivationReason, setInactivationReason] = useState("")
  const [showInactiveClients, setShowInactiveClients] = useState(false)

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.cnpj.includes(searchTerm)

    if (showInactiveClients) {
      return client.status === "inactive" && matchesSearch
    } else {
      return (client.status === "active" || client.status === "overdue") && matchesSearch
    }
  })

  const handleRegisterPayment = (client: any) => {
    setSelectedClient(client)
    setIsPaymentModalOpen(true)
  }

  const handleInactivateClient = (clientId: string) => {
    setClientToInactivate(clientId)
    setIsInactivateModalOpen(true)
  }

  const confirmInactivation = () => {
    if (clientToInactivate && inactivationReason.trim()) {
      setClients((prevClients) =>
        prevClients.map((client) =>
          client.id === clientToInactivate ? { ...client, status: "inactive" as const, inactivationReason } : client,
        ),
      )
      setIsInactivateModalOpen(false)
      setClientToInactivate(null)
      setInactivationReason("")
    }
  }

  const cancelInactivation = () => {
    setIsInactivateModalOpen(false)
    setClientToInactivate(null)
    setInactivationReason("")
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
          <Button
            variant={showInactiveClients ? "default" : "outline"}
            className="gap-2 bg-transparent"
            onClick={() => setShowInactiveClients(!showInactiveClients)}
          >
            <Users className="h-4 w-4" />
            {showInactiveClients ? "Clientes Ativos" : "Clientes Inativos"}
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
          <CardTitle className="text-card-foreground">
            {showInactiveClients ? "Clientes Inativos" : "Lista de Clientes"}
          </CardTitle>
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
                {showInactiveClients && <TableHead>Motivo da Inativação</TableHead>}
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.id}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.cnpj}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {client.modules.map((module, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>R$ {client.fees.toLocaleString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        client.status === "active"
                          ? "default"
                          : client.status === "inactive"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {client.status === "active"
                        ? "Em dia"
                        : client.status === "inactive"
                          ? "Inativo"
                          : "Inadimplente"}
                    </Badge>
                  </TableCell>
                  {showInactiveClients && (
                    <TableCell className="max-w-xs">
                      <span className="text-sm text-muted-foreground truncate">
                        {client.inactivationReason || "Não informado"}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!showInactiveClients && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRegisterPayment(client)}>
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInactivateClient(client.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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

      {/* Modal de confirmação de inativação */}
      <Dialog open={isInactivateModalOpen} onOpenChange={setIsInactivateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inativar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da inativação</Label>
              <Textarea
                id="reason"
                placeholder="Digite o motivo da inativação do cliente..."
                value={inactivationReason}
                onChange={(e) => setInactivationReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelInactivation}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmInactivation} disabled={!inactivationReason.trim()}>
              Inativar Cliente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
