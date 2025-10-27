// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuração do cliente Prisma com retry
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
})

// Função para verificar a conexão com o banco de dados
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    return { connected: true }
  } catch (error) {
    return { connected: false, error }
  }
}

// Função para tentar reconectar ao banco de dados
export async function reconnectDatabase(retries = 3, delay = 1000) {
  let attempts = 0
  
  while (attempts < retries) {
    const { connected } = await checkDatabaseConnection()
    
    if (connected) {
      return true
    }
    
    attempts++
    console.log(`Tentativa ${attempts} de reconexão com o banco de dados...`)
    
    // Espera antes de tentar novamente
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  return false
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
