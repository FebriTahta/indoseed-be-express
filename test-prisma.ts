import { prisma } from './src/utils/prisma';
async function run() {
  console.log("Querying roles...");
  const roles = await prisma.role.findMany();
  console.log("Roles:", roles);
}
run().catch(console.error).finally(() => process.exit(0));
