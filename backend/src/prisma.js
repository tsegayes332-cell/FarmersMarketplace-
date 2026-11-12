const { PrismaClient } = require('@prisma/client');

// Global singleton PrismaClient instance to avoid connection exhaustion on Neon
let prisma;

if (!global.__prisma) {
  global.__prisma = new PrismaClient({
    log: ['error', 'warn']
  });
}
prisma = global.__prisma;

module.exports = prisma;

