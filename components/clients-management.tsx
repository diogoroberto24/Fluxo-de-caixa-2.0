"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Plus, Search, Eye, Edit, Trash2, Users, ArrowLeft, DollarSign, UserX, UserCheck, Building, Phone, Calendar, CreditCard } from "lucide-react"
import { ClientModal } from "./client-modal"
import { PaymentModal } from "./payment-modal"

interface ClientsManagementProps {
  onNavigate?: (tab: string) => void
}

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
  tributacao?: string
  originalData?: any
}

interface FeeHistory {
  date: string
  previousFee: number
  newFee: number
  reason: string
  changedBy: string
}

const mockFeeHistory: Record<string, FeeHistory[]> = {
  "001": [
    {
      date: "2024-01-01",
      previousFee: 0,
      newFee: 2000,
      reason: "Cadastro inicial do cliente",
      changedBy: "Sistema",
    },
    {
      date: "2024-06-15",
      previousFee: 2000,
      newFee: 2300,
      reason: "Reajuste anual - inflação",
      changedBy: "João Silva",
    },
    {
      date: "2024-11-01",
      previousFee: 2300,
      newFee: 2500,
      reason: "Adição de módulo fiscal",
      changedBy: "Maria Santos",
    },
  ],
  "002": [
    {
      date: "2023-08-10",
      previousFee: 0,
      newFee: 1000,
      reason: "Cadastro inicial do cliente",
      changedBy: "Sistema",
    },
    {
      date: "2024-08-10",
      previousFee: 1000,
      newFee: 1200,
      reason: "Reajuste anual contratual",
      changedBy: "Carlos Oliveira",
    },
  ],
  "003": [
    {
      date: "2023-03-20",
      previousFee: 0,
      newFee: 3500,
      reason: "Cadastro inicial do cliente",
      changedBy: "Sistema",
    },
    {
      date: "2023-09-15",
      previousFee: 3500,
      newFee: 4200,
      reason: "Expansão dos serviços - folha de pagamento",
      changedBy: "Ana Costa",
    },
    {
      date: "2024-03-20",
      previousFee: 4200,
      newFee: 4500,
      reason: "Reajuste anual",
      changedBy: "João Silva",
    },
  ],
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

const getTributacaoDisplay = (tributacaoValue?: string) => {
  switch (tributacaoValue) {
    case "mei":
      return "MEI";
    case "simples":
      return "SIMPLES NACIONAL";
    case "presumido":
      return "LUCRO PRESUMIDO";
    case "real":
      return "LUCRO REAL";
    default:
      return "Não informado";
  }
};

export function ClientsManagement({ onNavigate }: ClientsManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [isInactivateModalOpen, setIsInactivateModalOpen] = useState(false)
  const [clientToInactivate, setClientToInactivate] = useState<string | null>(null)
  const [inactivationReason, setInactivationReason] = useState("")
  const [showInactiveClients, setShowInactiveClients] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [clientToView, setClientToView] = useState<Client | null>(null)
  const [dbClients, setDbClients] = useState<Client[]>([])
  
  // Estados para reativação
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false)
  const [clientToReactivate, setClientToReactivate] = useState<string | null>(null)
  const [reactivationReason, setReactivationReason] = useState("")

  // Buscar clientes do banco de dados
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('/api/clients')
        if (response.ok) {
          const data = await response.json()
          
          // Mapear os clientes do banco para o formato esperado pelo componente
          const formattedClients = data.map((client: any) => {
            // Extrair os módulos dos produtos do cliente
            const modules = client.produtos?.map((p: any) => p.nome) || []
            
            // Calcular o valor total dos honorários
            const fees = client.honorarios || 0
            
            // Determinar o status baseado no campo 'ativo'
            const status = client.ativo ? "active" : "inactive"
            
            return {
              id: client.id,
              name: client.nome || client.razao_social,
              cnpj: client.cnpj || client.cpf,
              modules: modules,
              fees: fees,
              status: status,
              lastPayment: client.ultimo_pagamento || "N/A",
              phone: client.telefone || "N/A",
              email: client.email || "N/A",
              inactivationReason: client.observacao || "",
              tributacao: client.tributacao || "",
              originalData: client // Manter os dados originais para edição
            }
          })
          
          setDbClients(formattedClients)
          setClients(formattedClients)
        }
      } catch (error) {
        console.error("Erro ao buscar clientes:", error)
      }
    }
    
    fetchClients()
  }, [isClientModalOpen]) // Recarregar quando o modal de cliente for fechado

  // Remover o useEffect que combinava dados mockados com dados do banco
  // useEffect(() => {
  //   setClients([...mockClients, ...dbClients])
  // }, [dbClients])

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

  // Modificar a função confirmInactivation para realmente inativar o cliente
  const confirmInactivation = async () => {
    if (clientToInactivate && inactivationReason.trim()) {
      try {
        // Encontrar o cliente a ser inativado
        const clientToUpdate = clients.find(client => client.id === clientToInactivate);
        
        if (clientToUpdate) {
          // Preparar os dados para atualização
          const updateData = {
            id: clientToInactivate,
            status: "Inativo",
            ativo: false,
            observacao: inactivationReason
          };
          
          // Chamar a API para atualizar o cliente
          const response = await fetch(`/api/clients/${clientToInactivate}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
          
          if (response.ok) {
            // Atualizar o estado local
            setClients((prevClients) =>
              prevClients.map((client) =>
                client.id === clientToInactivate ? 
                  { ...client, status: "inactive" as const, inactivationReason } : 
                  client
              )
            );
            
            // Fechar o modal e limpar os campos
            setIsInactivateModalOpen(false);
            setClientToInactivate(null);
            setInactivationReason("");
          } else {
            throw new Error('Falha ao inativar cliente');
          }
        }
      } catch (error) {
        console.error("Erro ao inativar cliente:", error);
        // Aqui você poderia adicionar uma notificação de erro
      }
    }
  };
  
  const cancelInactivation = () => {
    setIsInactivateModalOpen(false)
    setClientToInactivate(null)
    setInactivationReason("")
  }

  const handleEditClient = (client: Client) => {
    // Se for um cliente do banco de dados, use os dados originais
    if ('originalData' in client) {
      setSelectedClient(client.originalData)
    } else {
      setSelectedClient(client)
    }
    setIsEditMode(true)
    setIsClientModalOpen(true)
  }

  const handleClientModalClose = () => {
    setIsClientModalOpen(false)
    setIsEditMode(false)
    setSelectedClient(null)
  }

  const [feeHistory, setFeeHistory] = useState<Record<string, FeeHistory[]>>({});

  const getClientFeeHistory = (clientId: string): FeeHistory[] => {
    if (feeHistory[clientId]){
      return feeHistory[clientId];
    }

    // Retornar histórico padrão apenas com dados do cliente atual
    return [
      {
        date: new Date().toISOString().split("T")[0],
        previousFee: 0,
        newFee: clients.find((c) => c.id === clientId)?.fees || 0,
        reason: "Cadastro inicial do cliente",
        changedBy: "Sistema",
      },
    ];
  }

  // Busca histórico do honorário
  const fetchFeeHistory = async (clientId: string) => {
    try{
      const response = await fetch(`/api/historico-honorario?clientId=${clientId}`);
      if (response.ok){
        const data = await response.json();

        // Converte o formato da API para o formato usado no componente
        const formattedHistory = data.map((item: any) => ({
          date: item.data,
          previousFee: item.valor_anterior,
          newFee: item.valor_novo,
          reason: item.motivo,
          changedBy: item.alterado_por,
        }));

        setFeeHistory(prev => ({
          ...prev,
          [clientId]: formattedHistory
        }));
      }
    } catch (error){
      console.log("Erro ao buscar histórico de honorário: ", error);
    }
  }

  const handleViewClient = (client: Client) => {
    setClientToView(client)
    setIsViewModalOpen(true)

    // Buscar o histórico de honorários quando visualizar o cliente
    if (client.id){
      fetchFeeHistory(client.id);
    }
  }

  const handleViewModalClose = () => {
    setIsViewModalOpen(false)
    setClientToView(null)
  }

  // Função para iniciar o processo de reativação
  const handleReactivateClient = (clientId: string) => {
    setClientToReactivate(clientId)
    setIsReactivateModalOpen(true)
  }

  // Função para confirmar a reativação
  const confirmReactivation = async () => {
    if (clientToReactivate && reactivationReason.trim()) {
      try {
        // Encontrar o cliente a ser reativado
        const clientToUpdate = clients.find(client => client.id === clientToReactivate);
        
        if (clientToUpdate) {
          // Preparar os dados para atualização
          const updateData = {
            id: clientToReactivate,
            status: "Ativo",
            ativo: true,
            observacao: ""
          };
          
          // Chamar a API para atualizar o cliente
          const response = await fetch(`/api/clients/${clientToReactivate}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData),
          });
          
          if (response.ok) {
            // Atualizar o estado local
            setClients((prevClients) =>
              prevClients.map((client) =>
                client.id === clientToReactivate ? 
                  { ...client, status: "active" as const, inactivationReason: "" } : 
                  client
              )
            );
            
            // Fechar o modal e limpar os campos
            setIsReactivateModalOpen(false);
            setClientToReactivate(null);
            setReactivationReason("");
          } else {
            throw new Error('Falha ao reativar cliente');
          }
        }
      } catch (error) {
        console.error("Erro ao reativar cliente:", error);
        // Aqui você poderia adicionar uma notificação de erro
      }
    }
  };

  // Função para cancelar a reativação
  const cancelReactivation = () => {
    setIsReactivateModalOpen(false)
    setClientToReactivate(null)
    setReactivationReason("")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("clients")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Clientes Fixos</h1>
            <p className="text-muted-foreground mt-1">Gerencie clientes com contratos recorrentes</p>
          </div>
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
              {filteredClients.map((client, index) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{String(index + 1).padStart(2, '0')}</TableCell>
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
                      <Button variant="ghost" size="sm" onClick={() => handleViewClient(client)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!showInactiveClients ? (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
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
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactivateClient(client.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={handleClientModalClose}
        isEditMode={isEditMode}
        clientData={selectedClient}
      />
      <PaymentModal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} clientId={selectedClient?.id || ''} clientName={selectedClient?.name || ''} />

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

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Visualização Completa do Cliente
            </DialogTitle>
          </DialogHeader>

          {clientToView && (
            <div className="space-y-6 py-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Dados da Empresa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Nome/Razão Social</Label>
                      <p className="text-sm font-medium">{clientToView.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">CNPJ/CPF</Label>
                      <p className="text-sm">{clientToView.cnpj}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tipo de Tributação</Label>
                      <p className="text-sm">
                          {!clientToView.tributacao ? "Não definido" : 
                          clientToView.tributacao === "mei" 
                            ? "MEI" 
                            : clientToView.tributacao === "simples" 
                              ? "Simples Nacional" 
                              : clientToView.tributacao === "presumido" 
                                ? "Lucro Presumido" 
                                : clientToView.tributacao === "real"
                                  ? "Lucro Real" 
                                  : "Outro"}         
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Contato
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
                      <p className="text-sm">{clientToView.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">E-mail</Label>
                      <p className="text-sm">{clientToView.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Último Pagamento</Label>
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(clientToView.lastPayment).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Módulos e Honorários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Módulos Contratados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {clientToView.modules.map((module, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {module}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Honorários Atuais
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">R$ {clientToView.fees.toLocaleString("pt-BR")}</p>
                    <p className="text-sm text-muted-foreground">Valor mensal</p>
                    <div className="mt-2">
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge
                          variant={
                            clientToView.status === "active"
                              ? "default"
                              : clientToView.status === "inactive"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {clientToView.status === "active"
                            ? "Em dia"
                            : clientToView.status === "inactive"
                              ? "Inativo"
                              : "Inadimplente"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Alterações de Honorários */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Alterações de Honorários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getClientFeeHistory(clientToView.id).map((history, index) => (
                      <div key={index} className="border-l-2 border-blue-200 pl-4 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="font-medium text-sm">
                              {new Date(history.date).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {history.changedBy}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              De: <span className="font-medium">R$ {history.previousFee.toLocaleString("pt-BR")}</span>
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-green-600">
                              Para: <span className="font-medium">R$ {history.newFee.toLocaleString("pt-BR")}</span>
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{history.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleViewModalClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de reativação */}
      <Dialog open={isReactivateModalOpen} onOpenChange={setIsReactivateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Reativação do Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja reativar este cliente? Todas as funcionalidades que foram perdidas na inativação serão restauradas.
            </p>
            <div className="space-y-2">
              <Label htmlFor="reactivation-reason">Motivo da reativação *</Label>
              <Textarea
                id="reactivation-reason"
                placeholder="Digite o motivo da reativação do cliente..."
                value={reactivationReason}
                onChange={(e) => setReactivationReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelReactivation}>
              Cancelar
            </Button>
            <Button 
              onClick={confirmReactivation}
              disabled={!reactivationReason.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirmar Reativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}