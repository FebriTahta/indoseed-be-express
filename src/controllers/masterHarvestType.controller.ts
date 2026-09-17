import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getHarvestTypes = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10, search, status, varietyId } = req.query;

    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const where: any = {};

    if (search) {
      where.OR = [
        { kode: { contains: search as string } },
        { nama: { contains: search as string } }
      ];
    }
    
    if (status) {
      where.status = status as string;
    }

    if (varietyId) {
      where.varietyId = varietyId as string;
    }

    const [total, harvestTypes] = await Promise.all([
      prisma.harvestType.count({ where }),
      prisma.harvestType.findMany({
        where,
        skip,
        take,
        include: {
          variety: {
            include: {
              commodity: true
            }
          },
          prices: {
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      status: 'success',
      data: harvestTypes,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: Number(page),
        pageSize: take
      }
    });
  } catch (error: any) {
    console.error('getHarvestTypes error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch harvest types' });
  }
};

export const getHarvestTypeDetail = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const harvestType = await prisma.harvestType.findUnique({
      where: { id },
      include: {
        variety: {
          include: { commodity: true }
        },
        prices: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!harvestType) {
      return res.status(404).json({ status: 'error', message: 'Harvest type not found' });
    }

    res.status(200).json({ status: 'success', data: harvestType });
  } catch (error: any) {
    console.error('getHarvestTypeDetail error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch harvest type detail' });
  }
};

export const createHarvestType = async (req: Request, res: Response) => {
  try {
    const { kode, nama, varietyId, status, initialPrice } = req.body;

    const newHarvestType = await prisma.harvestType.create({
      data: {
        kode: kode as string,
        nama: nama as string,
        varietyId: varietyId as string,
        status: (status as string) || 'Aktif',
        ...(initialPrice ? {
          prices: {
            create: {
              harga: Number(initialPrice),
              keterangan: 'Harga Awal'
            }
          }
        } : {})
      },
      include: {
        variety: true,
        prices: true
      }
    });

    res.status(201).json({ status: 'success', message: 'Harvest type created successfully', data: newHarvestType });
  } catch (error: any) {
    console.error('createHarvestType error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: 'error', message: 'Kode tipe panen sudah ada' });
    }
    res.status(500).json({ status: 'error', message: error.message || 'Failed to create harvest type' });
  }
};

export const updateHarvestType = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { kode, nama, varietyId, status } = req.body;

    const updatedHarvestType = await prisma.harvestType.update({
      where: { id },
      data: {
        kode: kode as string,
        nama: nama as string,
        varietyId: varietyId as string,
        status: status as string
      },
      include: {
        variety: true,
        prices: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    res.status(200).json({ status: 'success', message: 'Harvest type updated successfully', data: updatedHarvestType });
  } catch (error: any) {
    console.error('updateHarvestType error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: 'error', message: 'Kode tipe panen sudah ada' });
    }
    res.status(500).json({ status: 'error', message: error.message || 'Failed to update harvest type' });
  }
};

export const deleteHarvestType = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.harvestType.delete({
      where: { id }
    });
    res.status(200).json({ status: 'success', message: 'Harvest type deleted successfully' });
  } catch (error: any) {
    console.error('deleteHarvestType error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to delete harvest type' });
  }
};

export const addHarvestTypePrice = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string; // harvestTypeId
    const { harga, keterangan } = req.body;

    const harvestType = await prisma.harvestType.findUnique({
      where: { id }
    });

    if (!harvestType) {
      return res.status(404).json({ status: 'error', message: 'Harvest type not found' });
    }

    const newPrice = await prisma.harvestTypePrice.create({
      data: {
        harvestTypeId: id,
        harga: Number(harga),
        keterangan: keterangan as string
      }
    });

    res.status(201).json({ status: 'success', message: 'Price added successfully', data: newPrice });
  } catch (error: any) {
    console.error('addHarvestTypePrice error:', error);
    res.status(500).json({ status: 'error', message: error.message || 'Failed to add price' });
  }
};
