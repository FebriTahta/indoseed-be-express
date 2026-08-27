import { prisma } from './src/utils/prisma';

async function main() {
  await prisma.laboratorium.deleteMany({});
  console.log('Laboratorium table cleared');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
