"use client"

import type React from "react"

import { useState } from "react"
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
}

export function ClientModal({ isOpen, onClose }: ClientModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    address: "",
    partnerCpf: "",
    partnerAddress: "",
    taxationType: "",
    modules: [] as string[],
    fees: "",
    observations: "",
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Cliente cadastrado com sucesso!",
      description: "O novo cliente foi adicionado ao sistema.",
    })
    onClose()
    setFormData({
      name: "",
      document: "",
      email: "",
      phone: "",
      address: "",
      partnerCpf: "",
      partnerAddress: "",
      taxationType: "",
      modules: [],
      fees: "",
      observations: "",
    })
  }

  const handleModuleChange = (moduleId: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      modules: checked ? [...prev.modules, moduleId] : prev.modules.filter((m) => m !== moduleId),
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome/Razão Social</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="document">CNPJ/CPF</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData((prev) => ({ ...prev, document: e.target.value }))}
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
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-medium">Sócios (Opcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerCpf">CPF do Sócio</Label>
                <Input
                  id="partnerCpf"
                  value={formData.partnerCpf}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerCpf: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label htmlFor="partnerAddress">Endereço do Sócio</Label>
                <Input
                  id="partnerAddress"
                  value={formData.partnerAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, partnerAddress: e.target.value }))}
                  placeholder="Endereço completo"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="taxationType">Tipo de Tributação</Label>
            <Select
              value={formData.taxationType}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, taxationType: value }))}
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
            <Label>Módulos Contratados</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={module.id}
                    checked={formData.modules.includes(module.id)}
                    onCheckedChange={(checked) => handleModuleChange(module.id, checked as boolean)}
                  />
                  <Label htmlFor={module.id}>{module.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="fees">Honorários Mensais</Label>
            <Input
              id="fees"
              value={formData.fees}
              onChange={(e) => setFormData((prev) => ({ ...prev, fees: e.target.value }))}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="observations">Observações</Label>
            <Textarea
              id="observations"
              value={formData.observations}
              onChange={(e) => setFormData((prev) => ({ ...prev, observations: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Cadastrar Cliente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
