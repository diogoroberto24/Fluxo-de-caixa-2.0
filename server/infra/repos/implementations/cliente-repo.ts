import { prisma } from "@/lib/db";
import {
  Cliente,
  IClienteRepository,
  ListClientesInput,
  CreateClienteInput,
  UpdateClienteInput,
} from "../interfaces/cliente-repo";

export class ClienteRepository implements IClienteRepository {
  async create(data: CreateClienteInput): Promise<Cliente> {
    const cliente = await prisma.cliente.create({
      data,
    });

    return cliente;
  }

  async update(id: string, data: UpdateClienteInput): Promise<Cliente> {
    const cliente = await prisma.cliente.update({
      where: { id },
      data: data,
    });

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

  async findMany(filters: ListClientesInput): Promise<{
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
