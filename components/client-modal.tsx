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
    cliente_rua: "",
    cliente_numero: "",
    cliente_bairro: "",
    cliente_cidade: "",
    cliente_estado: "",
    cliente_pais: "Brasil",
    socio_nome: "",
    socio_documento: "",
    socio_rua: "",
    socio_numero: "",
    socio_bairro: "",
    socio_cidade: "",
    socio_estado: "",
    socio_pais: "Brasil",
    tributacao: "",
    modulos: [] as string[],
    honorarios: "",
    observacao: "",
    status: "Ativo",
    ativo: true
  })
  
  // Novo estado para controlar se o valor dos honorários foi modificado manualmente
  const [honorariosModificados, setHonorariosModificados] = useState(false)

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

  // Função para calcular o valor sugerido de honorários com base nos módulos selecionados
  const calcularHonorariosSugeridos = (modulos: string[]) => {
    // Valor base por módulo (R$ 1.000,00)
    const valorPorModulo = 1000
    return modulos.length * valorPorModulo
  }

  // Remover a duplicação das constantes modules e taxationTypes aqui
  
  useEffect(() => {
    if (isEditMode && clientData) {
      const moduleMapping: Record<string, string> = {
        Contábil: "contabil",
        Fiscal: "fiscal",
        "Folha de Pagamento": "trabalhista",
        Societário: "societario",
      }

      // Extrai os módulos dos produtos do cliente
      let mappedModules: string[] =[];

      if (clientData.produtos && Array.isArray(clientData.produtos)){
        // Mapea os nomes dos produtos para os IDs dos módulos
        mappedModules = clientData.produtos.map((produto: any) => {
          const produtoNome = produto.nome || (produto.produto && produto.produto.nome);

          // Verifica se o nome do produto corresponde a algum módulo
          for(const [moduloLabel, moduloId] of Object.entries(moduleMapping)){
            if(produtoNome === moduloLabel){
              return moduloId;
            }
          }

          // Se não encontrar correspondência, tenta converter diretamente
          return moduleMapping[produtoNome] || produtoNome.toLowerCase();
        }).filter(Boolean); //Remove valores vazios
      }

      // Se clientData.modulos existe (para clientes mockados), usar diretamente
      else if (clientData.modulos && Array.isArray(clientData.modulos)){
        mappedModules = clientData.modulos.map((module: string) => moduleMapping[module] || module.toLowerCase());
      }
      setFormData({
        nome: clientData.nome || "",
        documento: clientData.documento || "",
        email: clientData.email || "",
        telefone: clientData.telefone || "",
        cliente_rua: clientData.cliente_rua || "",
        cliente_numero: clientData.cliente_numero || "",
        cliente_bairro: clientData.cliente_bairro || "",
        cliente_cidade: clientData.cliente_cidade || "",
        cliente_estado: clientData.cliente_estado || "",
        cliente_pais: clientData.cliente_pais || "Brasil",
        socio_nome: clientData.socio_nome || "",
        socio_documento: clientData.socio_documento || "",
        socio_rua: clientData.socio_rua || "",
        socio_numero: clientData.socio_numero || "",
        socio_bairro: clientData.socio_bairro || "",
        socio_cidade: clientData.socio_cidade || "",
        socio_estado: clientData.socio_estado || "",
        socio_pais: clientData.socio_pais || "Brasil",
        tributacao: clientData.tributacao || "",
        modulos: mappedModules,
        honorarios: clientData.honorarios?.toString() || "",
        observacao: clientData.observacao || "",
        status: clientData.status || "Ativo",
        ativo: clientData.ativo !== undefined ? clientData.ativo : true
      })
      
      // Se o cliente já tem honorários definidos, considerar como modificado manualmente
      if (clientData.honorarios) {
        setHonorariosModificados(true)
      }
    } else if (!isEditMode) {
      setFormData({
        nome: "",
        documento: "",
        email: "",
        telefone: "",
        cliente_rua: "",
        cliente_numero: "",
        cliente_bairro: "",
        cliente_cidade: "",
        cliente_estado: "",
        cliente_pais: "Brasil",
        socio_nome: "",
        socio_documento: "",
        socio_rua: "",
        socio_numero: "",
        socio_bairro: "",
        socio_cidade: "",
        socio_estado: "",
        socio_pais: "Brasil",
        tributacao: "",
        modulos: [],
        honorarios: "",
        observacao: "",
        status: "Ativo",
        ativo: true
      })
      setHonorariosModificados(false)
    }
  }, [isEditMode, clientData, isOpen])

  // Adicionar um useEffect para atualizar os honorários sugeridos quando os módulos mudarem
  useEffect(() => {
    // Só atualiza automaticamente se o usuário não tiver modificado manualmente
    if (!honorariosModificados && formData.modulos.length > 0) {
      const valorSugerido = calcularHonorariosSugeridos(formData.modulos)
      setFormData(prev => ({
        ...prev,
        honorarios: valorSugerido.toString()
      }))
    }
  }, [formData.modulos, honorariosModificados])

  // Modificar o handler de módulos para resetar o flag de honorários modificados quando todos os módulos forem desmarcados
  const handleModuleChange = (moduleId: string, checked: boolean) => {
    const updatedModules = checked
      ? [...formData.modulos, moduleId]
      : formData.modulos.filter((id) => id !== moduleId)
    
    setFormData({ ...formData, modulos: updatedModules })
    
    // Se todos os módulos forem desmarcados, resetar o flag de honorários modificados
    if (updatedModules.length === 0) {
      setHonorariosModificados(false)
      setFormData(prev => ({
        ...prev,
        honorarios: ""
      }))
    }
  }

  // Modificar o handler de honorários para marcar como modificado manualmente
  const handleHonorariosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHonorariosModificados(true)
    setFormData({ ...formData, honorarios: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Primeiro, buscar todos os produtos uma única vez
      const produtosResponse = await fetch('/api/produtos');
      const produtos = await produtosResponse.json();
      
      // Criar um array de promessas para processar cada módulo
      const produtosPromises = formData.modulos.map(async (moduleId) => {
        // Encontrar o módulo correspondente para obter o label
        const modulo = modules.find(m => m.id === moduleId);
        const moduloNome = modulo?.label || moduleId;
        
        // Buscar se o produto já existe
        let produto = produtos.find((p: any) => 
          p.nome === moduloNome && p.tipo === 'servico' && p.direcao === 'entrada'
        );
        
        // Se não existir, criar o produto
        if (!produto) {
          const createResponse = await fetch('/api/produtos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nome: moduloNome,
              descricao: `Módulo ${moduloNome}`,
              valor: 0,
              tipo: 'servico',
              direcao: 'entrada'
            }),
          });
          
          if (!createResponse.ok) {
            throw new Error(`Erro ao criar produto para o módulo ${moduloNome}`);
          }
          
          produto = await createResponse.json();
        }

        return {
          produto_id: produto.id,
          nome: produto.nome,
          descricao: produto.descricao || `Módulo ${moduloNome}`,
          quantidade: 1,
          valor: parseInt(formData.honorarios) || 0,
          status: "Ativo",
          ativo: true
        };
      });

      // Aguardar a criação de todos os produtos
      const produtosFormatados = await Promise.all(produtosPromises);

      // Converter honorarios para número
      const honorariosValue = parseInt(formData.honorarios) || 0
      
      // Se estiver em modo de edição e os honorários foram alterados, registra no histórico
      if (isEditMode && clientData && clientData.honorarios !== honorariosValue){
        await fetch('/api/historico-honorario', {	
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cliente_id: clientData.id,
            valor_anterior: clientData.honorarios || 0,
            valor_novo: honorariosValue,
            motivo: "Alteração manual de honorários",
            alterado_por: "Sistema" // Idealmente, usar o nome do usuário logado
          }),
        });
      }
      // Agora criar ou atualizar o cliente com os produtos e honorários
      const apiUrl = '/api/clients';
      const method = isEditMode ? 'PUT' : 'POST';
      const payload = isEditMode 
        ? { id: clientData.id, ...formData, honorarios: honorariosValue, produtos: produtosFormatados } 
        : { ...formData, honorarios: honorariosValue, produtos: produtosFormatados };

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
          cliente_rua: "",
          cliente_numero: "",
          cliente_bairro: "",
          cliente_cidade: "",
          cliente_estado: "",
          cliente_pais: "Brasil",
          socio_nome: "",
          socio_documento: "",
          socio_rua: "",
          socio_numero: "",
          socio_bairro: "",
          socio_cidade: "",
          socio_estado: "",
          socio_pais: "Brasil",
          tributacao: "",
          modulos: [],
          honorarios: "",
          observacao: "",
          status: "Ativo",
          ativo: true
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome/Razão Social*</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="documento">CNPJ/CPF*</Label>
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
              <Label htmlFor="email">E-mail*</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone*</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-medium">Endereço do Cliente*</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_rua">Rua*</Label>
                <Input
                  id="cliente_rua"
                  value={formData.cliente_rua}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_rua: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente_numero">Número*</Label>
                <Input
                  id="cliente_numero"
                  value={formData.cliente_numero}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_numero: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_bairro">Bairro*</Label>
                <Input
                  id="cliente_bairro"
                  value={formData.cliente_bairro}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_bairro: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente_cidade">Cidade*</Label>
                <Input
                  id="cliente_cidade"
                  value={formData.cliente_cidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_cidade: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cliente_estado">Estado*</Label>
                <Input
                  id="cliente_estado"
                  value={formData.cliente_estado}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_estado: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="cliente_pais">País*</Label>
                <Input
                  id="cliente_pais"
                  value={formData.cliente_pais}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cliente_pais: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t pt-4">
            <Label className="text-base font-medium">Sócios (Opcional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="socio_nome">Nome do Sócio</Label>
                <Input
                  id="socio_nome"
                  value={formData.socio_nome}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_nome: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="socio_documento">CPF do Sócio</Label>
                <Input
                  id="socio_documento"
                  value={formData.socio_documento}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_documento: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
              <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="socio_rua">Rua</Label>
                <Input
                  id="socio_rua"
                  value={formData.socio_rua}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_rua: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="socio_numero">Número</Label>
                <Input
                  id="socio_numero"
                  value={formData.socio_numero}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_numero: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="socio_bairro">Bairro</Label>
                <Input
                  id="socio_bairro"
                  value={formData.socio_bairro}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_bairro: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="socio_cidade">Cidade</Label>
                <Input
                  id="socio_cidade"
                  value={formData.socio_cidade}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_cidade: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="socio_estado">Estado</Label>
                <Input
                  id="socio_estado"
                  value={formData.socio_estado}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_estado: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="socio_pais">País</Label>
                <Input
                  id="socio_pais"
                  value={formData.socio_pais}
                  onChange={(e) => setFormData((prev) => ({ ...prev, socio_pais: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="tributacao">Tipo de Tributação*</Label>
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
            <Label htmlFor="modulos">Módulos Contratados*</Label>
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
            <Label htmlFor="honorarios">Honorários Mensais*</Label>
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
