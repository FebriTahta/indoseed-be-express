import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getMasterParameters = async (req: Request, res: Response) => {
  try {
    const { search, namaModul, status, page, pageSize } = req.query;

    const parsedPage = page ? parseInt(page as string) : 1;
    const parsedPageSize = pageSize ? parseInt(pageSize as string) : 100; // default large if needed

    const where: any = {};

    if (namaModul && namaModul !== 'ALL') {
      where.namaModul = namaModul as string;
    }
    if (status) {
      where.status = status as string;
    }

    if (search) {
      where.OR = [
        { nama: { contains: search as string } },
        { kode: { contains: search as string } },
        { deskripsi: { contains: search as string } },
      ];
    }

    const skip = (parsedPage - 1) * parsedPageSize;

    const [items, totalItems] = await Promise.all([
      prisma.masterParameter.findMany({
        where,
        skip,
        take: parsedPageSize,
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
      }),
      prisma.masterParameter.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / parsedPageSize);

    return res.status(200).json({
      status: 'success',
      message: 'Data master parameter berhasil diambil',
      data: items,
      pagination: {
        currentPage: parsedPage,
        pageSize: parsedPageSize,
        totalItems,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching master parameters:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getMasterParameterById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const item = await prisma.masterParameter.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { urutan: 'asc' },
        },
      },
    });

    if (!item) {
      return res.status(404).json({
        status: 'error',
        message: 'Master parameter tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Detail master parameter berhasil diambil',
      data: item,
    });
  } catch (error: any) {
    console.error('Error fetching master parameter by id:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const createMasterParameter = async (req: AuthRequest, res: Response) => {
  try {
    const {
      kode,
      nama,
      namaModul = 'OFF_TYPE',
      tipeNilai = 'NUMBER',
      satuan,
      batasLulus,
      deskripsi,
      status = 'Aktif',
      options = [],
    } = req.body;

    if (!kode || !nama) {
      return res.status(400).json({
        status: 'error',
        message: 'Kode dan Nama parameter wajib diisi',
      });
    }

    // Check kode uniqueness
    const existing = await prisma.masterParameter.findUnique({
      where: { kode: kode.trim().toUpperCase() },
    });

    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: `Parameter dengan kode '${kode}' sudah ada`,
      });
    }

    const newItem = await prisma.masterParameter.create({
      data: {
        kode: kode.trim().toUpperCase(),
        nama: nama.trim(),
        namaModul: (namaModul || 'OFF_TYPE').trim().toUpperCase(),
        tipeNilai,
        satuan: satuan ? satuan.trim() : null,
        batasLulus: batasLulus !== undefined && batasLulus !== null && batasLulus !== '' ? parseFloat(batasLulus) : null,
        deskripsi: deskripsi ? deskripsi.trim() : null,
        status,
        options:
          tipeNilai === 'OPTION' && Array.isArray(options) && options.length > 0
            ? {
                create: options.map((opt: any, index: number) => ({
                  kode: opt.kode ? opt.kode.trim().toUpperCase() : `OPT_${index + 1}`,
                  nama: opt.nama.trim(),
                  bobot: opt.bobot !== undefined && opt.bobot !== null && opt.bobot !== '' ? parseFloat(opt.bobot) : 0,
                  urutan: opt.urutan ?? index + 1,
                  status: opt.status || 'Aktif',
                })),
              }
            : undefined,
      },
      include: {
        options: {
          orderBy: { urutan: 'asc' },
        },
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Master parameter berhasil dibuat',
      data: newItem,
    });
  } catch (error: any) {
    console.error('Error creating master parameter:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateMasterParameter = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.masterParameter.findUnique({
      where: { id },
      include: { options: true },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Master parameter tidak ditemukan',
      });
    }

    const {
      kode,
      nama,
      namaModul,
      tipeNilai,
      satuan,
      batasLulus,
      deskripsi,
      status,
      options = [],
    } = req.body;

    if (kode && kode.trim().toUpperCase() !== existing.kode) {
      const codeCheck = await prisma.masterParameter.findUnique({
        where: { kode: kode.trim().toUpperCase() },
      });
      if (codeCheck) {
        return res.status(400).json({
          status: 'error',
          message: `Parameter dengan kode '${kode}' sudah ada`,
        });
      }
    }

    // Delete existing options if options array provided or tipeNilai changed away from OPTION
    const targetTipe = tipeNilai || existing.tipeNilai;

    await prisma.$transaction(async (tx) => {
      if (targetTipe === 'OPTION' && Array.isArray(options)) {
        await tx.masterParameterOption.deleteMany({
          where: { parameterId: id },
        });

        if (options.length > 0) {
          await tx.masterParameterOption.createMany({
            data: options.map((opt: any, index: number) => ({
              parameterId: id,
              kode: opt.kode ? opt.kode.trim().toUpperCase() : `OPT_${index + 1}`,
              nama: opt.nama.trim(),
              bobot: opt.bobot !== undefined && opt.bobot !== null && opt.bobot !== '' ? parseFloat(opt.bobot) : 0,
              urutan: opt.urutan ?? index + 1,
              status: opt.status || 'Aktif',
            })),
          });
        }
      } else if (targetTipe !== 'OPTION') {
        await tx.masterParameterOption.deleteMany({
          where: { parameterId: id },
        });
      }

      await tx.masterParameter.update({
        where: { id },
        data: {
          kode: kode ? kode.trim().toUpperCase() : undefined,
          nama: nama ? nama.trim() : undefined,
          namaModul: namaModul ? namaModul.trim().toUpperCase() : undefined,
          tipeNilai: targetTipe,
          satuan: satuan !== undefined ? (satuan ? satuan.trim() : null) : undefined,
          batasLulus: batasLulus !== undefined ? (batasLulus !== null && batasLulus !== '' ? parseFloat(batasLulus) : null) : undefined,
          deskripsi: deskripsi !== undefined ? (deskripsi ? deskripsi.trim() : null) : undefined,
          status: status || undefined,
        },
      });
    });

    const updated = await prisma.masterParameter.findUnique({
      where: { id },
      include: {
        options: {
          orderBy: { urutan: 'asc' },
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Master parameter berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating master parameter:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const deleteMasterParameter = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.masterParameter.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: 'Master parameter tidak ditemukan',
      });
    }

    await prisma.masterParameter.delete({
      where: { id },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Master parameter berhasil dihapus',
    });
  } catch (error: any) {
    console.error('Error deleting master parameter:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const getModulList = async (_req: Request, res: Response) => {
  try {
    const distinctModuls = await prisma.masterParameter.findMany({
      select: { namaModul: true },
      distinct: ['namaModul'],
    });

    const defaultModuls = ['OFF_TYPE', 'QC', 'VARIETAS', 'MONITORING_LAHAN'];

    const moduls = Array.from(
      new Set([
        ...defaultModuls,
        ...distinctModuls.map((m) => m.namaModul),
      ])
    );

    return res.status(200).json({
      status: 'success',
      message: 'Daftar modul berhasil diambil',
      data: moduls,
    });
  } catch (error: any) {
    console.error('Error fetching modul list:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
