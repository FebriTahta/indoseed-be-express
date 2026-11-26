import prisma from './src/utils/prisma';

async function check() {
  try {
    const sortasiCols = await prisma.$queryRawUnsafe('DESCRIBE sortasi');
    console.log('SORTASI COLS:', sortasiCols);
    const gudangCols = await prisma.$queryRawUnsafe('DESCRIBE gudang_bahan_belum_diproses');
    console.log('GUDANG COLS:', gudangCols);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
