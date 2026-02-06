// Prisma client singleton with SQLite adapter for Prisma 7
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create adapter with Config object (not Client)
const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL || 'file:./dev.db'
});

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
