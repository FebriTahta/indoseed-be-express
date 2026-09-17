import { prisma } from '../src/utils/prisma';

async function main() {
  console.log('🌱 Start seeding Kangkung and Parameters...');

  // 1. Ensure Commodity exists
  let commodity = await prisma.commodity.findFirst({
    where: { kodeKomoditas: 'CM-KANGKUNG' },
  });

  if (!commodity) {
    commodity = await prisma.commodity.create({
      data: {
        kodeKomoditas: 'CM-KANGKUNG',
        namaKomoditas: 'Kangkung',
        kategori: 'Hortikultura',
      },
    });
    console.log('✅ Created Commodity:', commodity.namaKomoditas);
  }

  // 2. Ensure Variety exists
  let variety = await prisma.variety.findFirst({
    where: {
      kodeVarietas: 'VR-KANGKUNG-01',
      commodityId: commodity.id,
    },
  });

  if (!variety) {
    variety = await prisma.variety.create({
      data: {
        kodeVarietas: 'VR-KANGKUNG-01',
        namaVarietas: 'Kangkung Bisi',
        commodityId: commodity.id,
      },
    });
    console.log('✅ Created Variety:', variety.namaVarietas);
  }

  // 3. Define Parameters to seed
  const paramsToSeed = [
    {
      kode: 'PRM-TG-TNM',
      nama: 'Tinggi Tanaman',
      namaModul: 'MONITORING_LAHAN',
      tipeNilai: 'NUMBER',
      satuan: 'cm',
      vpData: {
        operator: '>',
        nilaiNumber: 27,
      },
    },
    {
      kode: 'PRM-KND-DN',
      nama: 'Kondisi Daun',
      namaModul: 'MONITORING_LAHAN',
      tipeNilai: 'OPTION',
      batasLulus: 2,
      options: [
        { kode: 'OPT_DN_1', nama: 'Buruk', bobot: 1, urutan: 1 },
        { kode: 'OPT_DN_2', nama: 'Baik', bobot: 2, urutan: 2 },
      ],
      vpData: {
        operator: '>=',
        nilaiOptionIndex: 1, // 'Baik'
      },
    },
    {
      kode: 'PRM-KND-TNH',
      nama: 'Kondisi Tanah',
      namaModul: 'MONITORING_LAHAN',
      tipeNilai: 'OPTION',
      batasLulus: 2,
      options: [
        { kode: 'OPT_TNH_1', nama: 'Lembab', bobot: 1, urutan: 1 },
        { kode: 'OPT_TNH_2', nama: 'Kering', bobot: 2, urutan: 2 },
        { kode: 'OPT_TNH_3', nama: 'Normal', bobot: 3, urutan: 3 },
      ],
      vpData: {
        operator: '>=',
        nilaiOptionIndex: 1, // 'Kering'
      },
    },
    {
      kode: 'PRM-SRG-HM',
      nama: 'Serangan Hama',
      namaModul: 'MONITORING_LAHAN',
      tipeNilai: 'OPTION',
      batasLulus: 2,
      options: [
        { kode: 'OPT_HM_1', nama: 'Berat', bobot: 1, urutan: 1 },
        { kode: 'OPT_HM_2', nama: 'Ringan', bobot: 2, urutan: 2 },
        { kode: 'OPT_HM_3', nama: 'Tidak Ada', bobot: 3, urutan: 3 },
      ],
      vpData: {
        operator: '>=',
        nilaiOptionIndex: 1, // 'Ringan'
      },
    },
  ];

  for (const pData of paramsToSeed) {
    // Upsert MasterParameter
    const param = await prisma.masterParameter.upsert({
      where: { kode: pData.kode },
      update: {
        nama: pData.nama,
        namaModul: pData.namaModul,
        tipeNilai: pData.tipeNilai,
        satuan: pData.satuan || null,
        batasLulus: (pData as any).batasLulus || null,
      },
      create: {
        kode: pData.kode,
        nama: pData.nama,
        namaModul: pData.namaModul,
        tipeNilai: pData.tipeNilai,
        satuan: pData.satuan || null,
        batasLulus: (pData as any).batasLulus || null,
      },
    });

    let optionId = null;

    if (pData.tipeNilai === 'OPTION' && (pData as any).options) {
      const createdOptions = [];
      for (const opt of (pData as any).options) {
        const option = await prisma.masterParameterOption.upsert({
          where: {
            parameterId_kode: {
              parameterId: param.id,
              kode: opt.kode,
            }
          } as any, // Using raw condition if unique constraint not exactly matching, better to use findFirst + create/update
          update: {
            nama: opt.nama,
            bobot: opt.bobot,
            urutan: opt.urutan,
          },
          create: {
            parameterId: param.id,
            kode: opt.kode,
            nama: opt.nama,
            bobot: opt.bobot,
            urutan: opt.urutan,
          },
        }).catch(async () => {
          // Fallback if unique constraint doesn't exist
          const existingOpt = await prisma.masterParameterOption.findFirst({
            where: { parameterId: param.id, kode: opt.kode }
          });
          if (existingOpt) {
            return prisma.masterParameterOption.update({
              where: { id: existingOpt.id },
              data: { nama: opt.nama, bobot: opt.bobot, urutan: opt.urutan }
            });
          } else {
            return prisma.masterParameterOption.create({
              data: { parameterId: param.id, kode: opt.kode, nama: opt.nama, bobot: opt.bobot, urutan: opt.urutan }
            });
          }
        });
        createdOptions.push(option);
      }

      if ((pData as any).vpData.nilaiOptionIndex !== undefined) {
        optionId = createdOptions[(pData as any).vpData.nilaiOptionIndex]?.id;
      }
    }
    console.log('✅ Ensured Parameter:', param.nama);

    // Filter out vpData fields that don't belong directly
    const { nilaiOptionIndex, ...vpDataValues } = (pData as any).vpData;
    const finalVpData = optionId ? { ...vpDataValues, optionId } : vpDataValues;

    // Upsert VarietyParameter
    await prisma.varietyParameter.upsert({
      where: {
        varietyId_parameterId: {
          varietyId: variety.id,
          parameterId: param.id,
        },
      },
      update: {
        ...finalVpData,
      },
      create: {
        varietyId: variety.id,
        parameterId: param.id,
        ...finalVpData,
      },
    });
    console.log('✅ Linked VarietyParameter for:', param.nama);
  }

  console.log('🎉 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
