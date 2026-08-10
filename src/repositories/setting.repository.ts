import { Setting } from '@prisma/client';
import { prisma } from '../utils/prisma';

export const settingRepository = {
  getSetting: async (): Promise<Setting | null> => {
    return await prisma.setting.findFirst();
  },

  updateSetting: async (data: {
    namaWebsite?: string;
    titleWebsite?: string;
    logoWebsite?: string;
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
          logoWebsite: data.logoWebsite || null,
          logoColor: data.logoColor || null,
        },
      });
    }
  },
};
