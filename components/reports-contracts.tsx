"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, FileText, Plus } from "lucide-react"
import { ReportsChart } from "@/components/reports-chart"



export function ReportsContracts() {
  const [reportType, setReportType] = useState("")

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e Contratos</h1>
          <p className="text-muted-foreground mt-1">Gere relatórios e gerencie contratos de clientes</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Gerar Contrato
        </Button>
      </div>

      {/* Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Geração de Relatórios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Relatório Mensal</SelectItem>
                <SelectItem value="quarterly">Relatório Trimestral</SelectItem>
                <SelectItem value="semiannual">Relatório Semestral</SelectItem>
                <SelectItem value="annual">Relatório Anual</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full gap-2" disabled={!reportType}>
              <Download className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </CardContent>
        </Card>

        <ReportsChart />
      </div>

      {/* Contracts Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Contratos Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo de Serviço</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* TODO: Implementar busca de contratos reais da API */}
              {[].map((contract: any) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.id}</TableCell>
                  <TableCell>{contract.client}</TableCell>
                  <TableCell>{contract.type}</TableCell>
                  <TableCell>{contract.value}</TableCell>
                  <TableCell>{contract.startDate}</TableCell>
                  <TableCell>
                    <Badge variant={contract.status === "Ativo" ? "default" : "secondary"}>{contract.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {[].length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum contrato encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
