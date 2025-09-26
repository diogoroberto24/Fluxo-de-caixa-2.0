import { PrismaClienteRepository } from './implementations/prisma-cliente-repository'
import { PrismaProdutoRepository } from './implementations/prisma-produto-repository'
import { PrismaCobrancaRepository } from './implementations/prisma-cobranca-repository'
import { PrismaCategoriaRepository } from './implementations/prisma-categoria-repository'
import { PrismaBalancoRepository } from './implementations/prisma-balanco-repository'

// Factory para criar instâncias dos repositórios
export class RepositoryFactory {
  private static _clienteRepository: PrismaClienteRepository
  private static _produtoRepository: PrismaProdutoRepository
  private static _cobrancaRepository: PrismaCobrancaRepository
  private static _categoriaRepository: PrismaCategoriaRepository
  private static _balancoRepository: PrismaBalancoRepository

  static get clienteRepository(): PrismaClienteRepository {
    if (!this._clienteRepository) {
      this._clienteRepository = new PrismaClienteRepository()
    }
    return this._clienteRepository
  }

  static get produtoRepository(): PrismaProdutoRepository {
    if (!this._produtoRepository) {
      this._produtoRepository = new PrismaProdutoRepository()
    }
    return this._produtoRepository
  }

  static get cobrancaRepository(): PrismaCobrancaRepository {
    if (!this._cobrancaRepository) {
      this._cobrancaRepository = new PrismaCobrancaRepository()
    }
    return this._cobrancaRepository
  }

  static get categoriaRepository(): PrismaCategoriaRepository {
    if (!this._categoriaRepository) {
      this._categoriaRepository = new PrismaCategoriaRepository()
    }
    return this._categoriaRepository
  }

  static get balancoRepository(): PrismaBalancoRepository {
    if (!this._balancoRepository) {
      this._balancoRepository = new PrismaBalancoRepository()
    }
    return this._balancoRepository
  }
}

// Exportar instâncias para uso direto
export const clienteRepository = RepositoryFactory.clienteRepository
export const produtoRepository = RepositoryFactory.produtoRepository
export const cobrancaRepository = RepositoryFactory.cobrancaRepository
export const categoriaRepository = RepositoryFactory.categoriaRepository
export const balancoRepository = RepositoryFactory.balancoRepository