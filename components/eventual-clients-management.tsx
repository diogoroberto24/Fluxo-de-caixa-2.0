"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Search, Eye, Edit, Trash2, ArrowLeft } from "lucide-react"
import { EventualClientModal } from "./eventual-client-modal"

interface EventualClient {
  id: string
  nome: string
  documento: string
  telefone: string
  email: string
  valor_servico: number
  parcelamento: string
  observacoes?: string
  ativo: boolean
  data_de_criacao: string
  valor_entrada?: number
  quantidade_parcelas?: number
  valor_parcelas?: number // Novo campo adicionado
  parcelas_config?: string
}

interface EventualClientsManagementProps {
  onNavigate: (tab: string) => void
}

export function EventualClientsManagement({ onNavigate }: EventualClientsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<EventualClient | null>(null)
  const [clients, setClients] = useState<EventualClient[]>([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<string | null>(null)
  const [deleteReason, setDeleteReason] = useState("")
  const [showInactiveClients, setShowInactiveClients] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [clientToView, setClientToView] = useState<EventualClient | null>(null)

  // Buscar clientes eventuais do banco de dados
  useEffect(() => {
    const fetchEventualClients = async () => {
      try {
        const response = await fetch('/api/eventual-clients')
        if (response.ok) {
          const data = await response.json()
          setClients(data)
        }
      } catch (error) {
        console.error("Erro ao buscar clientes eventuais:", error)
      }
    }
    
    fetchEventualClients()
  }, [isClientModalOpen])

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.documento.includes(searchTerm) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = showInactiveClients ? !client.ativo : client.ativo
    return matchesSearch && matchesStatus
  })

  const handleNewClient = () => {
    setSelectedClient(null)
    setIsEditMode(false)
    setIsClientModalOpen(true)
  }

  const handleEditClient = (client: EventualClient) => {
    setSelectedClient(client)
    setIsEditMode(true)
    setIsClientModalOpen(true)
  }

  const handleViewClient = (client: EventualClient) => {
    setClientToView(client)
    setIsViewModalOpen(true)
  }

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!clientToDelete) return

    try {
      const response = await fetch(`/api/eventual-clients/${clientToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: deleteReason })
      })

      if (response.ok) {
        setClients(clients.filter(client => client.id !== clientToDelete))
        setIsDeleteModalOpen(false)
        setClientToDelete(null)
        setDeleteReason("")
      }
    } catch (error) {
      console.error("Erro ao excluir cliente eventual:", error)
    }
  }

  const handleSaveClient = async (clientData: any) => {
    try {
      const url = isEditMode ? `/api/eventual-clients/${clientData.id}` : '/api/eventual-clients'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clientData)
      })

      if (response.ok) {
        const savedClient = await response.json()
        
        if (isEditMode) {
          setClients(clients.map(client => 
            client.id === savedClient.id ? savedClient : client
          ))
        } else {
          setClients([...clients, savedClient])
        }
      }
    } catch (error) {
      console.error("Erro ao salvar cliente eventual:", error)
    }
  }

  const getParcelamentoLabel = (parcelamento: string) => {
    switch (parcelamento) {
      case "AVISTA": return "À Vista"
      case "PARCELADO": return "Parcelado"
      case "ENTRADA_PARCELAS": return "Entrada + Parcelas"
      default: return parcelamento
    }
  }

  const getParcelamentoBadgeColor = (parcelamento: string) => {
    switch (parcelamento) {
      case "AVISTA": return "bg-green-100 text-green-800"
      case "PARCELADO": return "bg-blue-100 text-blue-800"
      case "ENTRADA_PARCELAS": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getParcelamentoDisplay = (client: EventualClient) => {
    switch (client.parcelamento) {
      case "AVISTA":
        return <Badge variant="default">À Vista</Badge>
      case "PARCELADO":
        const parcelas = client.parcelas_config ? JSON.parse(client.parcelas_config) : []
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="secondary">Parcelado</Badge>
            <span className="text-xs text-muted-foreground">
              {parcelas.length} parcelas
            </span>
          </div>
        )
      case "ENTRADA_PARCELAS":
        const parcelasEntrada = client.parcelas_config ? JSON.parse(client.parcelas_config) : []
        return (
          <div className="flex flex-col gap-1">
            <Badge variant="outline">Entrada + Parcelas</Badge>
            <span className="text-xs text-muted-foreground">
              Entrada: R$ {((client.valor_entrada || 0) / 100).toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-muted-foreground">
              {parcelasEntrada.length} parcelas
            </span>
          </div>
        )
      default:
        return <Badge variant="secondary">Não definido</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("clients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clientes Eventuais</h1>
            <p className="text-muted-foreground">
              Gerencie clientes para serviços pontuais sem recorrência
            </p>
          </div>
        </div>
        <Button onClick={handleNewClient} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Novo Cliente</span>
        </Button>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, documento ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button
              variant={showInactiveClients ? "default" : "outline"}
              onClick={() => setShowInactiveClients(!showInactiveClients)}
            >
              {showInactiveClients ? "Ver Ativos" : "Ver Inativos"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes Eventuais</CardTitle>
          <CardDescription>
            {filteredClients.length} cliente(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Valor do Serviço</TableHead>
                <TableHead>Parcelamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client, index) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    {String(index + 1).padStart(2, '0')}
                  </TableCell>
                  <TableCell>{client.nome}</TableCell>
                  <TableCell>{client.documento}</TableCell>
                  <TableCell>{client.telefone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    R$ {(client.valor_servico / 100).toFixed(2).replace('.', ',')}
                  </TableCell>
                  <TableCell>
                    {getParcelamentoDisplay(client)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={client.ativo ? "default" : "secondary"}>
                      {client.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClient(client)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClient(client)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Cliente */}
      <EventualClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
        client={selectedClient}
        isEditMode={isEditMode}
      />

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {clientToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Nome:</Label>
                  <p>{clientToView.nome}</p>
                </div>
                <div>
                  <Label className="font-semibold">Documento:</Label>
                  <p>{clientToView.documento}</p>
                </div>
                <div>
                  <Label className="font-semibold">Telefone:</Label>
                  <p>{clientToView.telefone}</p>
                </div>
                <div>
                  <Label className="font-semibold">E-mail:</Label>
                  <p>{clientToView.email}</p>
                </div>
                <div>
                  <Label className="font-semibold">Valor do Serviço:</Label>
                  <p>R$ {(clientToView.valor_servico / 100).toFixed(2).replace('.', ',')}</p>
                </div>
                <div>
                  <Label className="font-semibold">Parcelamento:</Label>
                  <p>{getParcelamentoLabel(clientToView.parcelamento)}</p>
                </div>
              </div>
              {clientToView.observacoes && (
                <div>
                  <Label className="font-semibold">Observações:</Label>
                  <p className="mt-1">{clientToView.observacoes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este cliente eventual? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="deleteReason">Motivo da exclusão:</Label>
              <Textarea
                id="deleteReason"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Descreva o motivo da exclusão..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={!deleteReason.trim()}
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}