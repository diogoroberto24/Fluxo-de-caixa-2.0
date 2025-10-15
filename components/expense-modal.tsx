"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { ContaPagar } from "@/shared/types"

interface ExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingExpense?: ContaPagar | null
}

export function ExpenseModal({ isOpen, onClose, onSuccess, editingExpense }: ExpenseModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    descricao: "",
    valor: "",
    data_vencimento: "",
    categoria: "",
    recorrencia: "ESPORADICA",
  })

  useEffect(() => {
    if (editingExpense) {
      setFormData({
        descricao: editingExpense.descricao,
        valor: (editingExpense.valor / 100).toString(),
        data_vencimento: editingExpense.data_vencimento.toISOString().split('T')[0],
        categoria: editingExpense.categoria,
        recorrencia: editingExpense.recorrencia,
      })
    } else {
      setFormData({
        descricao: "",
        valor: "",
        data_vencimento: "",
        categoria: "",
        recorrencia: "ESPORADICA",
      })
    }
  }, [editingExpense, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        categoria: formData.categoria,
        data_vencimento: formData.data_vencimento,
        recorrencia: formData.recorrencia,
      }

      let response
      if (editingExpense) {
        // Atualizar conta existente
        response = await fetch(`/api/v1/contas-a-pagar/${editingExpense.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // Criar nova conta
        response = await fetch("/api/v1/contas-a-pagar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      if (response.ok) {
        const data = await response.json()
        
        toast({
          title: "Sucesso!",
          description: editingExpense 
            ? "Conta atualizada com sucesso!" 
            : data.contasRecorrentes 
              ? `Conta criada com sucesso! ${data.contasRecorrentes.length} contas recorrentes foram geradas automaticamente.`
              : "Conta criada com sucesso!",
        })
        
        onSuccess()
      } else {
        const errorData = await response.json()
        toast({
          title: "Erro",
          description: errorData.error || "Erro ao salvar conta",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
    toast({
      title: "Conta cadastrada com sucesso!",
      description: "A nova conta foi adicionada ao sistema.",
    })
    onClose()
    setFormData({
      descricao: "",
      valor: "",
      data_vencimento: "",
      categoria: "",
      recorrencia: "ESPORADICA",
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
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="value">Valor</Label>
            <Input
              id="valor"
              value={formData.valor}
              onChange={(e) => setFormData((prev) => ({ ...prev, valor: e.target.value }))}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div>
            <Label htmlFor="dueDate">Data de Vencimento</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => setFormData((prev) => ({ ...prev, data_vencimento: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
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
              value={formData.recorrencia}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, recorrencia: value }))}
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
