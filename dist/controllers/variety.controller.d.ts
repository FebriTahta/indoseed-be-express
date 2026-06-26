import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const createVariety: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVarieties: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getVarietyById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateVariety: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteVariety: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=variety.controller.d.ts.map