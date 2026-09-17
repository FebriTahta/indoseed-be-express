import prisma from './src/utils/prisma';

async function main() {
  try {
    await prisma.masterParameter.findMany({
      where: {},
      skip: 0,
      take: 1,
      include: {
        options: {
          orderBy: { urutan: 'asc' },
        },
        varietyParameters: {
          include: {
            variety: {
              select: {
                id: true,
                namaVarietas: true,
                kodeVarietas: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    console.log("Success");
  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
