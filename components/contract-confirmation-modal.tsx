"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, X } from "lucide-react"

interface ContractConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  clienteId: string
  clienteNome: string
}

export function ContractConfirmationModal({ 
  isOpen, 
  onClose, 
  clienteId, 
  clienteNome 
}: ContractConfirmationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerateContract = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/v1/contratos/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao gerar contrato')
      }

      const data = await response.json()
      
      toast({
        title: "Contrato gerado com sucesso!",
        description: "O contrato foi criado e está disponível para download.",
        variant: "default"
      })

      // Abrir PDF em nova aba
      if (data.contrato.pdfUrl) {
        window.open(data.contrato.pdfUrl, '_blank')
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

  const handleSkip = () => {
    toast({
      title: "Cliente cadastrado com sucesso",
      description: "Você pode gerar o contrato posteriormente na seção 'Gestão de Contratos'.",
      variant: "default"
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerar Contrato
          </DialogTitle>
          <DialogDescription>
            Cliente cadastrado com sucesso! Deseja gerar o contrato agora?
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

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateContract}
              disabled={isGenerating}
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
              onClick={handleSkip}
              disabled={isGenerating}
              className="flex-1 gap-2"
            >
              <X className="h-4 w-4" />
              Pular
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}