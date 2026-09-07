import { config } from 'dotenv';
config();
async function main() {
  const { prisma } = await import('./src/lib/prisma');
  const user = await prisma.user.findFirst();
  console.log("DB User:", user);
  await prisma.$disconnect();
}
main();
