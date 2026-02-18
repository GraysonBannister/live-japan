import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Global declaration for Next.js hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client singleton
function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  
  // SQLite (development)
  if (databaseUrl.startsWith('file:')) {
    const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
    return new PrismaClient({ adapter });
  }
  
  // PostgreSQL (production)
  if (databaseUrl.includes('postgresql') || databaseUrl.includes('postgres')) {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  
  // Default to SQLite
  const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Save to global for hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}