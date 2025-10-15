import { prisma } from "@/lib/db";
import {
  Cliente,
  IClienteRepository,
  ClienteFilters,
  CreateClienteInput,
  UpdateClienteInput,
} from "../interfaces/cliente-repo";

export class ClienteRepository implements IClienteRepository {
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
        status: clienteData.status || "ativo",
        ativo: clienteData.ativo ?? true,
        metadata: clienteData.metadata || {},
      },
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
      },
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

  async findById(id: string): Promise<Cliente | null> {
    const cliente = await prisma.cliente.findUnique({
      where: { id },
    });

    if (!cliente) return null;

    return cliente;
  }

  async findByDocumento(documento: string): Promise<Cliente | null> {
    const cleanDoc = documento.replace(/[^\d]/g, "");

    const cliente = await prisma.cliente.findFirst({
      where: {
        OR: [{ documento }, { documento: cleanDoc }],
      },
    });

    if (!cliente) return null;

    return cliente;
  }

  async findMany(filters: ClienteFilters): Promise<{
    items: Cliente[];
    total: number;
  }> {
    const {
      search,
      status,
      tributacao,
      ativo,
      page = 1,
      limit = 10,
      orderBy = "data_de_criacao",
      order = "asc",
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      data_de_delecao: null,
    };

    if (search) {
      where.OR = [
        { nome: { contains: search, mode: "insensitive" } },
        { documento: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (tributacao) {
      where.tributacao = tributacao;
    }

    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    const orderByMap: Record<string, any> = {
      nome: { nome: order },
      documento: { documento: order },
      data_de_criacao: { data_de_criacao: order },
    };

    const [clientes, total] = await Promise.all([
      prisma.cliente.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByMap[orderBy] || { nome: "asc" },
      }),
      prisma.cliente.count({ where }),
    ]);

    return {
      items: clientes,
      total,
    };
  }

  async delete(id: string): Promise<void> {
    await prisma.cliente.delete({
      where: { id },
    });
  }

  async softDelete(id: string): Promise<void> {
    await prisma.cliente.update({
      where: { id },
      data: {
        data_de_delecao: new Date(),
        ativo: false,
      },
    });
  }

  async restore(id: string): Promise<void> {
    await prisma.cliente.update({
      where: { id },
      data: {
        data_de_delecao: null,
        ativo: true,
        status: "ATIVO",
      },
    });
  }

  async existsByDocumento(
    documento: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      documento,
      data_de_delecao: null,
    };
  
    if (excludeId) {
      where.id = { not: excludeId };
    }
  
    const count = await prisma.cliente.count({ where });
    return count > 0;
  }

  async findAllActive(): Promise<Cliente[]> {
    const clientes = await prisma.cliente.findMany({
      where: {
        ativo: true,
        status: "ATIVO",
        data_de_delecao: null,
      },
      orderBy: { nome: "asc" },
    });

    return clientes;
  }

  async countByStatus(): Promise<Record<string, number>> {
    const counts = await prisma.cliente.groupBy({
      by: ["status"],
      where: { data_de_delecao: null },
      _count: { status: true },
    });
  
    return counts.reduce((acc: Record<string, number>, item: any) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<string, number>);
  }
}
