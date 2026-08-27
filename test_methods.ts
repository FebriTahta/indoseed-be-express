import prisma from './src/utils/prisma';

async function main() {
    const methods = await prisma.testMethod.findMany();
    console.log("METHODS:", methods.map(m => m.nama));
}
main().finally(() => prisma.$disconnect());
