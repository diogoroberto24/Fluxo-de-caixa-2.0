"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck } from "lucide-react"

interface ClientsHubProps {
  onNavigate: (tab: string) => void
}

export function ClientsHub({ onNavigate }: ClientsHubProps) {
  const handleFixedClients = () => {
    onNavigate("clients-fixed")
  }

  const handleEventualClients = () => {
    onNavigate("clients-eventual")
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Clientes</h1>
        <p className="text-muted-foreground">
          Escolha o tipo de cliente que deseja gerenciar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Clientes Fixos */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Clientes Fixos</CardTitle>
            <CardDescription className="text-sm">
              Clientes com contratos recorrentes e faturamento mensal
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-muted-foreground mb-6 space-y-1">
              <li>• Contratos com recorrência</li>
              <li>• Faturamento automático</li>
              <li>• Gestão completa de produtos</li>
              <li>• Histórico de honorários</li>
            </ul>
            <Button 
              onClick={handleFixedClients}
              className="w-full"
              size="lg"
            >
              Acessar Clientes Fixos
            </Button>
          </CardContent>
        </Card>

        {/* Clientes Eventuais */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl">Clientes Eventuais</CardTitle>
            <CardDescription className="text-sm">
              Clientes para serviços pontuais sem recorrência
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <ul className="text-sm text-muted-foreground mb-6 space-y-1">
              <li>• Serviços pontuais</li>
              <li>• Cadastro simplificado</li>
              <li>• Opções de parcelamento</li>
              <li>• Sem recorrência</li>
            </ul>
            <Button 
              onClick={handleEventualClients}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              Acessar Clientes Eventuais
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}