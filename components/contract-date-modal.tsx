"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Calendar } from "lucide-react"

interface ContractDateModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNome: string
  onSuccess?: () => void
}

export function ContractDateModal({ 
  isOpen, 
  onClose, 
  clienteId, 
  clienteNome,
  onSuccess
}: ContractDateModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [useCurrentDate, setUseCurrentDate] = useState(true)
  const [customDate, setCustomDate] = useState("")
  const { toast } = useToast()

  const handleGenerateContract = async () => {
    setIsGenerating(true)
    try {
      // Preparar a data do contrato
      let dataContrato: Date | undefined = undefined
      
      if (!useCurrentDate && customDate) {
        const selectedDate = new Date(customDate)
        const today = new Date()
        
        // Validar se a data não é futura
        if (selectedDate > today) {
          toast({
            title: "Data inválida",
            description: "A data do contrato não pode ser futura.",
            variant: "destructive"
          })
          setIsGenerating(false)
          return
        }
        
        dataContrato = selectedDate
      }

      const response = await fetch('/api/v1/contratos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clienteId,
          dataContrato: dataContrato?.toISOString()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao gerar contrato')
      }

      const data = await response.json()
      
      toast({
        title: "Contrato gerado com sucesso!",
        description: `Contrato para ${clienteNome} foi criado e está disponível para download.`,
        variant: "default"
      })

      // Abrir PDF em nova aba
      if (data.contrato.pdfUrl) {
        window.open(data.contrato.pdfUrl, '_blank')
      }

      // Chamar callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess()
      }

      onClose()

    } catch (error) {
      console.error('Erro ao gerar contrato:', error)
      toast({
        title: "Erro ao gerar contrato",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Formatar data para input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Data máxima (hoje)
  const maxDate = formatDateForInput(new Date())

  // Reset form when modal closes
  const handleClose = () => {
    setUseCurrentDate(true)
    setCustomDate("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Contrato
          </DialogTitle>
          <DialogDescription>
            Configure a data do contrato e gere o documento para o cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>Cliente:</strong> {clienteNome}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              O contrato será gerado em PDF com base nos dados cadastrados.
            </p>
          </div>

          {/* Seleção de Data */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Data do Contrato
            </Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="current-date"
                  name="date-option"
                  checked={useCurrentDate}
                  onChange={() => setUseCurrentDate(true)}
                  className="h-4 w-4"
                />
                <Label htmlFor="current-date" className="text-sm cursor-pointer">
                  Usar data atual ({new Date().toLocaleDateString('pt-BR')})
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="custom-date"
                  name="date-option"
                  checked={!useCurrentDate}
                  onChange={() => setUseCurrentDate(false)}
                  className="h-4 w-4"
                />
                <Label htmlFor="custom-date" className="text-sm cursor-pointer">
                  Selecionar data personalizada
                </Label>
              </div>
              
              {!useCurrentDate && (
                <div className="ml-6">
                  <Input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    max={maxDate}
                    className="w-full"
                    placeholder="Selecione uma data"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A data não pode ser futura
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateContract}
              disabled={isGenerating || (!useCurrentDate && !customDate)}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Gerar Contrato
                </>
              )}
            </Button>

            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isGenerating}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}