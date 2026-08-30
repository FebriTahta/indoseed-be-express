import { Setting } from '@prisma/client';
import { prisma } from '../utils/prisma';

export const settingRepository = {
  getSetting: async (): Promise<Setting | null> => {
    return await prisma.setting.findFirst();
  },

  updateSetting: async (data: {
    namaWebsite?: string;
    titleWebsite?: string;
    deskripsi?: string;
    logoWebsite?: string;
    logoKotak?: string;
    logoColor?: string;
  }): Promise<Setting> => {
    const existing = await prisma.setting.findFirst();

    if (existing) {
      return await prisma.setting.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return await prisma.setting.create({
        data: {
          namaWebsite: data.namaWebsite || 'Indoseed',
          titleWebsite: data.titleWebsite || 'Indoseed ERP',
          deskripsi: data.deskripsi || null,
          logoWebsite: data.logoWebsite || null,
          logoKotak: data.logoKotak || null,
          logoColor: data.logoColor || null,
        },
      });
    }
  },
};
