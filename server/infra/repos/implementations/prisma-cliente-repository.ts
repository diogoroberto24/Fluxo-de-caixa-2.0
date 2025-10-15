import { prisma } from '@/lib/db'
import type { Cliente } from '@/shared/types'
import type { CreateClienteInput, UpdateClienteInput, ClienteFilters } from '@/shared/validation/clientes'
import type { ClienteRepository } from '../interfaces/cliente-repository'

export class PrismaClienteRepository implements ClienteRepository {
  async create(data: CreateClienteInput): Promise<Cliente> {
    // Extrair produtos do data para tratar separadamente
    const { produtos, ...clienteData } = data;
    
    const cliente = await prisma.cliente.create({
      data: {
        ...clienteData,
        // Garantir que campos obrigatórios tenham valores padrão
        representante_nome: clienteData.representante_nome || "",
        representante_rg: clienteData.representante_rg || "",
        representante_cpf: clienteData.representante_cpf || "",
        representante_rua: clienteData.representante_rua || "",
        representante_bairro: clienteData.representante_bairro || "",
        representante_municipio: clienteData.representante_municipio || "",
        representante_cep: clienteData.representante_cep || "",
        cliente_pais: clienteData.cliente_pais || "Brasil",
        honorarios: clienteData.honorarios || 0,
        status: clienteData.status || 'ATIVO',
        ativo: clienteData.ativo ?? true,
        metadata: clienteData.metadata || {}
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    });

    // Se há produtos, criar as relações ClienteProduto
    if (produtos && produtos.length > 0) {
      await Promise.all(
        produtos.map(produto =>
          prisma.clienteProduto.create({
            data: {
              cliente_id: cliente.id,
              produto_id: produto.produto_id,
              quantidade: produto.quantidade,
              nome: produto.nome,
              descricao: produto.descricao,
              valor: produto.valor,
              status: produto.status,
              ativo: produto.ativo,
            },
          })
        )
      );
    }

    return cliente;
  }

  async findById(id: string): Promise<Cliente | null> {
    return await prisma.cliente.findUnique({
      where: { id },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    return await prisma.cliente.findUnique({
      where: { documento },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async findMany(filters: ClienteFilters): Promise<{ data: Cliente[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      tributacao,
      ativo,
      orderBy = 'nome',
      order = 'asc'
    } = filters

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: 'insensitive' } },
        { documento: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status) {
      where.status = status
    }

    if (tributacao) {
      where.tributacao = tributacao
    }

    if (ativo !== undefined) {
      where.ativo = ativo
    }

    const [data, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderBy]: order },
        include: {
          produtos: true,
          cobrancas: true,
          recorrencias: true,
          historico_honorarios: true
        }
      }),
      prisma.cliente.count({ where })
    ])

    return { data, total }
  }

  async update(id: string, data: UpdateClienteInput): Promise<Cliente> {
    // Extrair produtos do data para tratar separadamente
    const { produtos, ...clienteData } = data;
    
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        ...clienteData,
        // Garantir que campos obrigatórios tenham valores padrão se fornecidos
        ...(clienteData.representante_nome !== undefined && { representante_nome: clienteData.representante_nome || "" }),
        ...(clienteData.representante_rg !== undefined && { representante_rg: clienteData.representante_rg || "" }),
        ...(clienteData.representante_cpf !== undefined && { representante_cpf: clienteData.representante_cpf || "" }),
        ...(clienteData.representante_rua !== undefined && { representante_rua: clienteData.representante_rua || "" }),
        ...(clienteData.representante_bairro !== undefined && { representante_bairro: clienteData.representante_bairro || "" }),
        ...(clienteData.representante_municipio !== undefined && { representante_municipio: clienteData.representante_municipio || "" }),
        ...(clienteData.representante_cep !== undefined && { representante_cep: clienteData.representante_cep || "" }),
        ...(clienteData.cliente_pais !== undefined && { cliente_pais: clienteData.cliente_pais || "Brasil" }),
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    });

    // Se há produtos para atualizar, primeiro remover os existentes e criar os novos
    if (produtos !== undefined) {
      // Remover produtos existentes
      await prisma.clienteProduto.deleteMany({
        where: { cliente_id: id },
      });

      // Criar novos produtos se fornecidos
      if (produtos.length > 0) {
        await Promise.all(
          produtos.map(produto =>
            prisma.clienteProduto.create({
              data: {
                cliente_id: id,
                produto_id: produto.produto_id,
                quantidade: produto.quantidade,
                nome: produto.nome,
                descricao: produto.descricao,
                valor: produto.valor,
                status: produto.status,
                ativo: produto.ativo,
              },
            })
          )
        );
      }
    }

    return cliente;
  }

  async delete(id: string): Promise<void> {
    await prisma.cliente.update({
      where: { id },
      data: {
        data_de_delecao: new Date(),
        ativo: false
      }
    })
  }

  async activate(id: string): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: {
        ativo: true,
        status: 'ATIVO',
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async deactivate(id: string): Promise<Cliente> {
    return await prisma.cliente.update({
      where: { id },
      data: {
        ativo: false,
        status: 'INATIVO',
        data_de_atualizacao: new Date()
      },
      include: {
        produtos: true,
        cobrancas: true,
        recorrencias: true,
        historico_honorarios: true
      }
    })
  }

  async exists(documento: string, excludeId?: string): Promise<boolean> {
    const where: any = { documento }
    
    if (excludeId) {
      where.NOT = { id: excludeId }
    }

    const count = await prisma.cliente.count({ where })
    return count > 0
  }
}