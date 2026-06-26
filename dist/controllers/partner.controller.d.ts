import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const createPartner: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPartners: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPartnerById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePartner: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePartner: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=partner.controller.d.ts.map