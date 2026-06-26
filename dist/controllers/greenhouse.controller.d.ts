import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
export declare const createGreenhouse: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getGreenhouses: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getGreenhouseById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateGreenhouse: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteGreenhouse: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=greenhouse.controller.d.ts.map