import { prisma } from '../src/utils/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log(`Start seeding ...`);
  
  const superadminRole = await prisma.role.upsert({
    where: { name: 'superadmin' },
    update: {},
    create: {
      name: 'superadmin',
    },
  });

  const hashedPassword = await bcrypt.hash('superadmin', 10);

  const superadminUser = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      email: 'superadmin@example.com', // placeholder
      password: hashedPassword,
      isEmailVerified: true,
      defaultRoleId: superadminRole.id,
      roles: {
        create: {
          roleId: superadminRole.id,
        },
      },
    },
  });

  console.log({ superadminUser, superadminRole });
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
