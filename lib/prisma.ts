import { PrismaMssql } from '@prisma/adapter-mssql'
import { PrismaClient } from '@/generated/prisma/client'
// import { PrismaClient } from "@prisma/client";

const config = {
  server: '10.225.9.50\\TRLOOSQLTESTDB',
  database: 'KokpitTestDB',
  user: 'kokpitdbuser',
  password: '34bdwkbFOQdfdVcQ',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
}

const adapter = new PrismaMssql(config)

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma