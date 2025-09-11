"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Phone, Mail, Calendar } from "lucide-react"

interface Client {
  id: string
  name: string
  cnpj: string
  modules: string[]
  fees: number
  status: "active" | "overdue"
  lastPayment: string
  phone: string
  email: string
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

interface ClientsModalProps {
  isOpen: boolean
  onClose: () => void
  clientType: "active" | "overdue" | "all"
}

export function ClientsModal({ isOpen, onClose, clientType }: ClientsModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = mockClients
    .filter((client) => {
      if (clientType === "all") {
        return client.status === "active" || client.status === "overdue"
      }
      if (clientType === "overdue") {
        return client.status === "overdue"
      }
      return client.status === clientType
    })
    .filter(
      (client) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.cnpj.includes(searchTerm),
    )

  const getTitle = () => {
    switch (clientType) {
      case "active":
        return "Clientes em Dia"
      case "overdue":
        return "Clientes Inadimplentes"
      case "all":
        return "Total de Clientes"
      default:
        return "Clientes"
    }
  }

  const getDescription = () => {
    switch (clientType) {
      case "active":
        return "Clientes em dia com os honorários"
      case "overdue":
        return "Clientes com pagamentos em atraso"
      case "all":
        return "Todos os clientes cadastrados no sistema"
      default:
        return "Lista de clientes"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-5xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">{getTitle()}</DialogTitle>
          <p className="text-sm text-muted-foreground">{getDescription()}</p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-6 py-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto h-[calc(100%-60px)] space-y-3 pr-2">
            {filteredClients.map((client) => (
              <div key={client.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-medium truncate">{client.name}</h3>
                      <Badge variant={client.status === "active" ? "default" : "destructive"}>
                        {client.status === "active" ? "Em dia" : "Inadimplente"}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>CNPJ: {client.cnpj}</p>
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{client.email}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Último pagamento: {new Date(client.lastPayment).toLocaleDateString("pt-BR")}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">Módulos:</span>
                      <div className="flex gap-1 flex-wrap">
                        {client.modules.map((module) => (
                          <Badge key={module} variant="outline" className="text-xs">
                            {module}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-right space-y-2 flex-shrink-0">
                    <div className="text-lg font-semibold">R$ {client.fees.toLocaleString("pt-BR")}</div>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <Button size="sm" variant="outline">
                        Ver Detalhes
                      </Button>
                      {client.status === "overdue" && <Button size="sm">Cobrar</Button>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
