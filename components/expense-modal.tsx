"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    description: "",
    value: "",
    dueDate: "",
    category: "",
    recurrence: "",
    observations: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Conta cadastrada com sucesso!",
      description: "A nova conta foi adicionada ao sistema.",
    })
    onClose()
    setFormData({
      description: "",
      value: "",
      dueDate: "",
      category: "",
      recurrence: "",
      observations: "",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta a Pagar</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="infraestrutura">Infraestrutura</SelectItem>
                <SelectItem value="tecnologia">Tecnologia</SelectItem>
                <SelectItem value="utilidades">Utilidades</SelectItem>
                <SelectItem value="suprimentos">Suprimentos</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="juridico">Jurídico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="recurrence">Recorrência</Label>
            <Select
              value={formData.recurrence}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, recurrence: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a recorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eventual">Eventual</SelectItem>
                <SelectItem value="mensal">Mensal</SelectItem>
                <SelectItem value="trimestral">Trimestral</SelectItem>
                <SelectItem value="semestral">Semestral</SelectItem>
                <SelectItem value="anual">Anual</SelectItem>
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
            <Button type="submit">Cadastrar Conta</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
