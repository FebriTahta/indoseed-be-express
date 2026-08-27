import { prisma } from '../utils/prisma';

export const PengujiRepository = {
  findAll: async (filters: { status?: string; laboratoriumId?: string; testMethodId?: string; search?: string; limit?: number; offset?: number }) => {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.laboratoriumId) where.laboratoriumId = filters.laboratoriumId;
    if (filters.search) {
      where.OR = [
        { kodePenguji: { contains: filters.search } },
        { nama: { contains: filters.search } },
      ];
    }
    
    if (filters.testMethodId) {
      where.metodeUji = {
        some: {
          testMethodId: filters.testMethodId
        }
      };
    }

    const total = await prisma.penguji.count({ where });
    const data = await prisma.penguji.findMany({
      where,
      include: {
        laboratorium: true,
        sertifikasi: true,
        user: true,
        metodeUji: {
          include: { testMethod: true }
        }
      },
      orderBy: { kodePenguji: 'asc' },
      take: filters.limit || 10,
      skip: filters.offset || 0,
    });

    return { total, data };
  },

  findById: async (id: string) => {
    return prisma.penguji.findUnique({
      where: { id },
      include: {
        laboratorium: true,
        sertifikasi: true,
        metodeUji: {
          include: { testMethod: true }
        }
      }
    });
  },

  create: async (data: any) => {
    const { 
      metodeUji, sertifikasi, 
      email, tanggalBergabung, keterangan, 
      noSertifikat, tanggalSertifikat, berlakuHingga, 
      foto, sertifikatFile, existingSertifikatUrl, 
      laboratoriumId,
      ...rest 
    } = data;
    
    // Auto generate kode if not provided
    if (!rest.kodePenguji) {
      const count = await prisma.penguji.count();
      rest.kodePenguji = `PGJ-${String(count + 1).padStart(4, '0')}`;
    }

    let userId: string | undefined = undefined;

    // Handle User creation if email is provided
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            username: email.split('@')[0] + Math.floor(Math.random() * 1000),
            email,
            password: 'password123', // Default password
          }
        });
        userId = newUser.id;
      }
    }

    // Build sertifikasi array if noSertifikat or namaSertifikasi is provided
    let sertifikasiData = sertifikasi || [];
    if (noSertifikat || berlakuHingga || sertifikatFile) {
      sertifikasiData.push({
        namaSertifikasi: noSertifikat || 'Sertifikasi Penguji',
        berlakuHingga: berlakuHingga ? new Date(berlakuHingga) : null,
        lampiranUrl: sertifikatFile || null
      });
    }

    return prisma.penguji.create({
      data: {
        ...rest,
        user: userId ? { connect: { id: userId } } : undefined,
        foto: foto || null,
        keterangan: keterangan || null,
        laboratorium: laboratoriumId ? { connect: { id: laboratoriumId } } : undefined,
        metodeUji: metodeUji && metodeUji.length > 0 ? {
          create: metodeUji.map((id: string) => ({
            testMethod: { connect: { id } }
          }))
        } : undefined,
        sertifikasi: sertifikasiData.length > 0 ? {
          create: sertifikasiData
        } : undefined
      },
      include: {
        laboratorium: true,
        sertifikasi: true,
        user: true,
        metodeUji: { include: { testMethod: true } }
      }
    });
  },

  update: async (id: string, data: any) => {
    const { 
      metodeUji, sertifikasi, 
      email, tanggalBergabung, keterangan, 
      noSertifikat, tanggalSertifikat, berlakuHingga, 
      foto, sertifikatFile, existingSertifikatUrl,
      laboratoriumId,
      ...rest 
    } = data;

    const currentPenguji = await prisma.penguji.findUnique({ where: { id }, include: { user: true, sertifikasi: true } });
    let userId = currentPenguji?.userId;

    if (email) {
      if (currentPenguji?.user) {
        await prisma.user.update({
          where: { id: currentPenguji.user.id },
          data: { email }
        });
      } else {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
          userId = existingUser.id;
        } else {
          const newUser = await prisma.user.create({
            data: {
              username: email.split('@')[0] + Math.floor(Math.random() * 1000),
              email,
              password: 'password123',
            }
          });
          userId = newUser.id;
        }
      }
    }

    // Handle metode uji updates (replace all)
    if (metodeUji) {
      await prisma.pengujiTestMethod.deleteMany({ where: { pengujiId: id } });
    }

    // Build sertifikasi array
    let sertifikasiData = sertifikasi || [];
    if (noSertifikat || berlakuHingga || sertifikatFile) {
      sertifikasiData.push({
        namaSertifikasi: noSertifikat || 'Sertifikasi Penguji',
        berlakuHingga: berlakuHingga ? new Date(berlakuHingga) : null,
        lampiranUrl: sertifikatFile || (currentPenguji?.sertifikasi?.[0]?.lampiranUrl) || null
      });
    }

    if (sertifikasiData.length > 0) {
      await prisma.sertifikasi.deleteMany({ where: { pengujiId: id } });
    }

    return prisma.penguji.update({
      where: { id },
      data: {
        ...rest,
        user: userId ? { connect: { id: userId } } : undefined,
        foto: foto || currentPenguji?.foto,
        keterangan: keterangan !== undefined ? keterangan : currentPenguji?.keterangan,
        laboratorium: laboratoriumId ? { connect: { id: laboratoriumId } } : (laboratoriumId === '' ? { disconnect: true } : undefined),
        metodeUji: metodeUji && metodeUji.length > 0 ? {
          create: metodeUji.map((methodId: string) => ({
            testMethod: { connect: { id: methodId } }
          }))
        } : undefined,
        sertifikasi: sertifikasiData.length > 0 ? {
          create: sertifikasiData
        } : undefined
      },
      include: {
        laboratorium: true,
        sertifikasi: true,
        user: true,
        metodeUji: { include: { testMethod: true } }
      }
    });
  },

  delete: async (id: string) => {
    return prisma.penguji.delete({
      where: { id }
    });
  },

  getStats: async () => {
    const total = await prisma.penguji.count();
    const aktif = await prisma.penguji.count({ where: { status: 'Aktif' } });
    const nonaktif = await prisma.penguji.count({ where: { status: 'Nonaktif' } });

    // Bersertifikat: at least one active certification
    const bersertifikatData = await prisma.penguji.findMany({
      where: { sertifikasi: { some: { status: 'Aktif' } } },
      select: { id: true }
    });
    const bersertifikat = bersertifikatData.length;

    // Akan Expired (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const akanExpiredData = await prisma.penguji.findMany({
      where: {
        sertifikasi: {
          some: {
            berlakuHingga: {
              lte: thirtyDaysFromNow,
              gte: new Date()
            },
            status: 'Aktif'
          }
        }
      },
      select: { id: true }
    });
    
    const akanExpired = akanExpiredData.length;

    return { total, aktif, nonaktif, bersertifikat, akanExpired };
  }
};
