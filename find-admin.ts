import { config } from 'dotenv';
config();
import { hashPassword } from './src/lib/auth';

async function main() {
  const { prisma } = await import('./src/lib/prisma');
  const admins = await prisma.user.findMany({
    where: { role: 'SUPER_ADMIN' }
  });

  if (admins.length > 0) {
    console.log("Found existing admin:");
    console.log("Email:", admins[0].email);

    // reset their password to admin123
    await prisma.user.update({
      where: { id: admins[0].id },
      data: { password: hashPassword('admin123') }
    });
    console.log("Password reset to: admin123");
  } else {
    console.log("No admins found, creating one...");
    const admin = await prisma.user.create({
      data: {
        email: 'admin@university.edu',
        name: 'Campus Admin',
        handle: 'campusadmin',
        password: hashPassword('admin123'),
        role: 'SUPER_ADMIN',
        onboardingCompleted: true
      }
    });
    console.log("Created admin:");
    console.log("Email:", admin.email);
    console.log("Password:", "admin123");
  }
  await prisma.$disconnect();
}
main();
