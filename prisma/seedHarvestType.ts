import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding Harvest Types (Tipe Panen)...');

  // 1. Ensure a Commodity exists
  let commodity = await prisma.commodity.findFirst({
    where: { kodeKomoditas: 'CM-JAGUNG' },
  });

  if (!commodity) {
    commodity = await prisma.commodity.create({
      data: {
        kodeKomoditas: 'CM-JAGUNG',
        namaKomoditas: 'Jagung',
        kategori: 'Pangan',
      },
    });
    console.log('✅ Created Commodity:', commodity.namaKomoditas);
  }

  // 2. Ensure a Variety exists
  let variety = await prisma.variety.findFirst({
    where: {
      kodeVarietas: 'VR-JAGUNG-01',
      commodityId: commodity.id,
    },
  });

  if (!variety) {
    variety = await prisma.variety.create({
      data: {
        kodeVarietas: 'VR-JAGUNG-01',
        namaVarietas: 'Jagung Bisi 18',
        commodityId: commodity.id,
      },
    });
    console.log('✅ Created Variety:', variety.namaVarietas);
  }

  // 3. Define Harvest Types to seed
  const harvestTypesToSeed = [
    {
      kode: 'TP-JAGUNG-001',
      nama: 'Gelondong / Fresh',
      prices: [
        { harga: 4500, keterangan: 'Harga awal gelondong musim hujan' },
        { harga: 5000, keterangan: 'Harga naik musim kemarau' }
      ]
    },
    {
      kode: 'TP-JAGUNG-002',
      nama: 'Pipil Kering',
      prices: [
        { harga: 7500, keterangan: 'Harga awal pipil kering' }
      ]
    }
  ];

  for (const htData of harvestTypesToSeed) {
    // Upsert HarvestType
    const harvestType = await prisma.harvestType.upsert({
      where: { kode: htData.kode },
      update: {
        nama: htData.nama,
        varietyId: variety.id,
        status: 'Aktif',
      },
      create: {
        kode: htData.kode,
        nama: htData.nama,
        varietyId: variety.id,
        status: 'Aktif',
      },
    });
    console.log(`✅ Ensured Harvest Type: ${harvestType.nama} (${harvestType.kode})`);

    // Add Prices for the HarvestType
    for (const priceData of htData.prices) {
      // Check if this specific price already exists to avoid duplicates
      const existingPrice = await prisma.harvestTypePrice.findFirst({
        where: {
          harvestTypeId: harvestType.id,
          harga: priceData.harga,
        }
      });

      if (!existingPrice) {
        await prisma.harvestTypePrice.create({
          data: {
            harvestTypeId: harvestType.id,
            harga: priceData.harga,
            keterangan: priceData.keterangan,
          }
        });
        console.log(`   💰 Added Price: Rp ${priceData.harga} for ${harvestType.nama}`);
      }
    }
  }

  console.log('🎉 Seeding Harvest Types finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
