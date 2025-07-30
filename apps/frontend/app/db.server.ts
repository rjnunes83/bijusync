import { PrismaClient } from "@prisma/client";

// Solução robusta para evitar múltiplas instâncias em dev (hot reload)
// e garantir singleton em produção e desenvolvimento.
declare global {
  // Para ambientes Node.js/TypeScript: evitar conflitos de escopo
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!globalThis.prismaGlobal) {
    globalThis.prismaGlobal = new PrismaClient();
  }
  prisma = globalThis.prismaGlobal;
}

export default prisma;