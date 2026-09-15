import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getVarietyParameters = async (req: Request, res: Response) => {
  try {
    const varietyId = req.params.varietyId as string;
    const { namaModul } = req.query;

    const variety = await prisma.variety.findUnique({
      where: { id: varietyId },
      select: { id: true, kodeVarietas: true, namaVarietas: true },
    });

    if (!variety) {
      return res.status(404).json({
        status: 'error',
        message: 'Varietas tidak ditemukan',
      });
    }

    const whereParameter: any = { status: 'Aktif' };
    if (namaModul && namaModul !== 'ALL') {
      whereParameter.namaModul = namaModul as string;
    }

    // Get all active master parameters for the specified modul
    const masterParams = await prisma.masterParameter.findMany({
      where: whereParameter,
      include: {
        options: {
          where: { status: 'Aktif' },
          orderBy: { urutan: 'asc' },
        },
      },
      orderBy: [{ namaModul: 'asc' }, { kode: 'asc' }],
    });

    // Get existing assigned variety parameters
    const existingVarietyParams = await prisma.varietyParameter.findMany({
      where: { varietyId },
      include: {
        option: true,
      },
    });

    const paramMap = new Map(existingVarietyParams.map((vp) => [vp.parameterId, vp]));

    const combined = masterParams.map((mp) => {
      const assigned = paramMap.get(mp.id);
      return {
        parameter: mp,
        varietyParameter: assigned || null,
      };
    });

    return res.status(200).json({
      status: 'success',
      message: 'Data parameter varietas berhasil diambil',
      variety,
      data: combined,
    });
  } catch (error: any) {
    console.error('Error fetching variety parameters:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const upsertVarietyParametersBatch = async (req: AuthRequest, res: Response) => {
  try {
    const varietyId = req.params.varietyId as string;
    const { parameters } = req.body;

    if (!Array.isArray(parameters)) {
      return res.status(400).json({
        status: 'error',
        message: 'Parameters harus berupa array',
      });
    }

    const variety = await prisma.variety.findUnique({
      where: { id: varietyId },
    });

    if (!variety) {
      return res.status(404).json({
        status: 'error',
        message: 'Varietas tidak ditemukan',
      });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of parameters) {
        const {
          parameterId,
          optionId = null,
          nilaiNumber = null,
          nilaiText = null,
          operator = null,
          nilaiMin = null,
          nilaiMax = null,
        } = item;

        if (!parameterId) continue;

        const isEmptyValue =
          optionId === null &&
          nilaiNumber === null &&
          (nilaiText === null || nilaiText === '') &&
          nilaiMin === null &&
          nilaiMax === null;

        if (isEmptyValue) {
          // If all values are empty/cleared, delete record if exists
          await tx.varietyParameter.deleteMany({
            where: {
              varietyId,
              parameterId: parameterId as string,
            },
          });
        } else {
          // Upsert variety parameter record
          await tx.varietyParameter.upsert({
            where: {
              varietyId_parameterId: {
                varietyId,
                parameterId: parameterId as string,
              },
            },
            create: {
              varietyId,
              parameterId: parameterId as string,
              optionId: optionId || null,
              nilaiNumber: nilaiNumber !== null && nilaiNumber !== undefined ? parseFloat(nilaiNumber) : null,
              nilaiText: nilaiText ? String(nilaiText).trim() : null,
              operator: operator || null,
              nilaiMin: nilaiMin !== null && nilaiMin !== undefined ? parseFloat(nilaiMin) : null,
              nilaiMax: nilaiMax !== null && nilaiMax !== undefined ? parseFloat(nilaiMax) : null,
            },
            update: {
              optionId: optionId || null,
              nilaiNumber: nilaiNumber !== null && nilaiNumber !== undefined ? parseFloat(nilaiNumber) : null,
              nilaiText: nilaiText ? String(nilaiText).trim() : null,
              operator: operator || null,
              nilaiMin: nilaiMin !== null && nilaiMin !== undefined ? parseFloat(nilaiMin) : null,
              nilaiMax: nilaiMax !== null && nilaiMax !== undefined ? parseFloat(nilaiMax) : null,
            },
          });
        }
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Parameter varietas berhasil disimpan',
    });
  } catch (error: any) {
    console.error('Error saving variety parameters:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

