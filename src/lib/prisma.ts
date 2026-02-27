import { PrismaClient } from '@/generated/prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const createPrismaClient = () => {
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
