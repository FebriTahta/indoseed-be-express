import { Request, Response } from 'express';
import { fileService } from '../services/file.service';

/** Nama file aman untuk header (ASCII) + versi UTF-8 sesuai RFC 5987. */
const contentDisposition = (type: 'attachment' | 'inline', fileName: string) => {
  const ascii = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
  return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

export const downloadFile = async (req: Request, res: Response) => {
  const { url, name, inline } = req.validated!.query as { url: string; name?: string; inline?: boolean };
  const file = await fileService.get(url, name);
  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Length', String(file.size));
  res.setHeader('Content-Disposition', contentDisposition(inline ? 'inline' : 'attachment', file.fileName));
  file.stream.on('error', (err) => {
    console.error('Stream file terputus:', err);
    res.destroy(err);
  });
  file.stream.pipe(res);
};
