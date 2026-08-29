import { prisma } from './src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  const user = await prisma.user.findUnique({ where: { username: 'superadmin' } });
  console.log('User found:', user ? user.username : null);
  if (user) {
    const isPasswordValid = await bcrypt.compare('superadmin', user.password);
    console.log('Password valid:', isPasswordValid);
    console.log('isEmailVerified:', user.isEmailVerified);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
