"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClientAutocomplete } from "@/components/ui/client-autocomplete"
import { useToast } from "@/hooks/use-toast"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  client?: any
  isEditMode?: boolean
  receivableData?: {
    id: number
    client: string
    value: string
    date: string
    method: string
    status: string
    observations: string
  } | null
}

export function PaymentModal({ isOpen, onClose, client, isEditMode = false, receivableData }: PaymentModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    clientName: "",
    value: "",
    date: "",
    method: "",
    observations: "",
  })

  useEffect(() => {
    if (isEditMode && receivableData) {
      // Convert date from DD/MM/YYYY to YYYY-MM-DD for input
      const dateParts = receivableData.date.split("/")
      const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : ""

      setFormData({
        clientName: receivableData.client,
        value: receivableData.value,
        date: formattedDate,
        method: receivableData.method.toLowerCase(),
        observations: receivableData.observations,
      })
    } else if (!isEditMode) {
      // Reset form when not editing
      setFormData({
        clientName: "",
        value: "",
        date: "",
        method: "",
        observations: "",
      })
    }
  }, [isEditMode, receivableData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: isEditMode ? "Pagamento atualizado com sucesso!" : "Pagamento registrado com sucesso!",
      description: isEditMode ? "As alterações foram salvas no sistema." : "O pagamento foi adicionado ao sistema.",
    })
    onClose()
    if (!isEditMode) {
      setFormData({
        clientName: "",
        value: "",
        date: "",
        method: "",
        observations: "",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Pagamento" : "Registrar Pagamento"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientName">Nome do Cliente</Label>
            <ClientAutocomplete
              value={formData.clientName}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, clientName: value }))}
              placeholder="Busque e selecione um cliente..."
            />
          </div>

          <div>
            <Label htmlFor="value">Valor Pago</Label>
            <Input
              id="value"
              type="text"
              placeholder="R$ 0,00"
              value={formData.value}
              onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Data do Pagamento</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="method">Método de Pagamento</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferência">Transferência</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="cartão">Cartão</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit">{isEditMode ? "Salvar Alterações" : "Registrar Pagamento"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
