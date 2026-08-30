const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const k = await prisma.qcTest.findMany({ where: { jenisUji: 'Kemurnian' } });
    console.log("KEMURNIAN:", k);
    
    const v = await prisma.qcTest.findMany({ where: { jenisUji: 'Vigor' } });
    console.log("VIGOR:", v);
}
main().finally(() => prisma.$disconnect());
