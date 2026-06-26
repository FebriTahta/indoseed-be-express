import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const createCommodity: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCommodities: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCommodityById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateCommodity: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteCommodity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=commodity.controller.d.ts.map