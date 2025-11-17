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



interface ClientsModalProps {
  isOpen: boolean
  onClose: () => void
  clientType: "active" | "overdue" | "all"
}

export function ClientsModal({ isOpen, onClose, clientType }: ClientsModalProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredClients = []
    .filter((client: any) => {
      if (clientType === "all") {
        return client.status === "active" || client.status === "overdue"
      }
      if (clientType === "overdue") {
        return client.status === "overdue"
      }
      return client.status === clientType
    })
    .filter(
      (client: any) => client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.cnpj.includes(searchTerm),
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
            {filteredClients.map((client: any) => (
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
                        {client.modules.map((module: string) => (
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
