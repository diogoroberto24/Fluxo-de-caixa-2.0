"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  isEditMode?: boolean
  clientData?: any
}

export function ClientModal({ isOpen, onClose, isEditMode = false, clientData }: ClientModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    documento: "",
    email: "",
    telefone: "",
    endereco: "",
    cpf_socio: "",
    endereco_socio: "",
    tributacao: "",
    modulos: [] as string[],
    honorarios: "",
    observacao: "",
  })

  useEffect(() => {
    if (isEditMode && clientData) {
      const moduleMapping: Record<string, string> = {
        Contábil: "contabil",
        Fiscal: "fiscal",
        "Folha de Pagamento": "trabalhista",
        Societário: "societario",
      }

      const mappedModules =
        clientData.modulos?.map((module: string) => moduleMapping[module] || module.toLowerCase()) || []

      setFormData({
        nome: clientData.nome || "",
        documento: clientData.documento || "",
        email: clientData.email || "",
        telefone: clientData.telefone || "",
        endereco: clientData.endereco || "",
        cpf_socio: clientData.cpf_socio || "",
        endereco_socio: clientData.endereco_socio || "",
        tributacao: clientData.tributacao || "",
        modulos: mappedModules,
        honorarios: clientData.honorarios?.toString() || "",
        observacao: clientData.observacao || "",
      })
    } else if (!isEditMode) {
      setFormData({
        nome: "",
        documento: "",
        email: "",
        telefone: "",
        endereco: "",
        cpf_socio: "",
        endereco_socio: "",
        tributacao: "",
        modulos: [],
        honorarios: "",
        observacao: "",
      })
    }
  }, [isEditMode, clientData, isOpen])

  const modules = [
    { id: "contabil", label: "Contábil" },
    { id: "fiscal", label: "Fiscal" },
    { id: "trabalhista", label: "Folha de Pagamento" },
    { id: "societario", label: "Societário" },
  ]

  const taxationTypes = [
    { value: "mei", label: "MEI" },
    { value: "simples", label: "Simples Nacional" },
    { value: "presumido", label: "Lucro Presumido" },
    { value: "real", label: "Lucro Real" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const apiUrl = '/api/clients'; // Sua API Route
      const method = isEditMode ? 'PUT' : 'POST';
      const payload = isEditMode ? { id: clientData.id, ...formData } : formData;

      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao salvar cliente');
      }

      toast({
        title: isEditMode ? "Cliente atualizado com sucesso!" : "Cliente cadastrado com sucesso!",
        description: isEditMode ? "Os dados do cliente foram atualizados." : "O novo cliente foi adicionado ao sistema.",
      })
      onClose()
      if (!isEditMode) {
        setFormData({
          nome: "",
          documento: "",
          email: "",
          telefone: "",
          endereco: "",
          cpf_socio: "",
          endereco_socio: "",
          tributacao: "",
          modulos: [],
          honorarios: "",
          observacao: "",
        })
      }
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error.message)
      toast({
        title: "Erro ao salvar cliente",
        description: error.message || "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  const handleModuleChange = (moduleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      modulos: checked ? [...prev.modulos, moduleId] : prev.modulos.filter((m) => m !== moduleId),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome/Razão Social</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="documento">CNPJ/CPF</Label>
              <Input
                id="documento"
                value={formData.documento}
                onChange={(e) => setFormData((prev) => ({ ...prev, documento: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData((prev) => ({ ...prev, endereco: e.target.value }))}
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-medium">Sócios (Opcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpf_socio">CPF do Sócio</Label>
                <Input
                  id="cpf_socio"
                  value={formData.cpf_socio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cpf_socio: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="endereco_socio">Endereço do Sócio</Label>
                <Input
                  id="endereco_socio"
                  value={formData.endereco_socio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, endereco_socio: e.target.value }))}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="tributacao">Tipo de Tributação</Label>
            <Select
              value={formData.tributacao}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, tributacao: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de tributação" />
              </SelectTrigger>
              <SelectContent>
                {taxationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="modulos">Módulos Contratados</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.id}
                    checked={formData.modulos.includes(module.id)}
                    onCheckedChange={(checked) => handleModuleChange(module.id, checked as boolean)}
                  />
                  <Label htmlFor={module.id}>{module.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="honorarios">Honorários Mensais</Label>
            <Input
              id="honorarios"
              value={formData.honorarios}
              onChange={(e) => setFormData((prev) => ({ ...prev, honorarios: e.target.value }))}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="observacao">Observações</Label>
            <Textarea
              id="observacao"
              value={formData.observacao}
              onChange={(e) => setFormData((prev) => ({ ...prev, observacao: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{isEditMode ? "Atualizar Cliente" : "Cadastrar Cliente"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
