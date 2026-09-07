import { config } from 'dotenv';
config();
import { hashPassword } from './src/lib/auth';

async function main() {
  const { prisma } = await import('./src/lib/prisma');
  const email = 'test@university.edu';
  const newPassword = 'password123';
  
  await prisma.user.update({
    where: { email },
    data: { password: hashPassword(newPassword) }
  });
  console.log(`Password for ${email} reset to ${newPassword}`);
  await prisma.$disconnect();
}
main();
