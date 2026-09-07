import { config } from 'dotenv';
config();
import { prisma } from './src/lib/prisma';
prisma.user.findFirst().then(user => {
  console.log(user);
}).finally(() => {
  prisma.$disconnect();
});
