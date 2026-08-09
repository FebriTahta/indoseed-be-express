import { Request, Response } from 'express';
import { settingRepository } from '../repositories/setting.repository';

export const getSetting = async (req: Request, res: Response) => {
  try {
    const setting = await settingRepository.getSetting();
    
    return res.status(200).json({
      status: 'success',
      message: 'Data pengaturan berhasil diambil',
      data: setting || {
        namaWebsite: 'Indoseed',
        titleWebsite: 'Indoseed ERP',
        logoWebsite: null,
        logoColor: null
      },
    });
  } catch (error: any) {
    console.error('Error fetching setting:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { namaWebsite, titleWebsite, logoWebsite, logoColor } = req.body;

    const updated = await settingRepository.updateSetting({
      namaWebsite,
      titleWebsite,
      logoWebsite,
      logoColor,
    });

    return res.status(200).json({
      status: 'success',
      message: 'Pengaturan berhasil diperbarui',
      data: updated,
    });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};
