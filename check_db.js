const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const methods = await prisma.testMethod.findMany();
    console.log("METHODS:", methods.map(m => m.nama));
    const tests = await prisma.qcTest.findMany();
    const counts = {};
    for (const t of tests) {
        counts[t.jenisUji] = (counts[t.jenisUji] || 0) + 1;
    }
    console.log("QC TESTS COUNT:", counts);
}
main().finally(() => prisma.$disconnect());
