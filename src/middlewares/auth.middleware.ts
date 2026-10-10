import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

import { RequestUser } from '../utils/requestContext';

export interface AuthRequest extends Request {
  user?: RequestUser;
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token is missing' });
    }

    jwt.verify(token, JWT_SECRET as string, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      req.user = user as any;
      next();
    });
  } else {
    res.status(401).json({ error: 'Authorization header is missing' });
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Sesi tidak valid, silakan login kembali.', error: 'Unauthorized' });
    }

    const hasRole = req.user.roles.some((role) => roles.includes(role));
    if (!hasRole) {
      const message = 'Akses ditolak: role Anda tidak memiliki izin untuk aksi ini.';
      return res.status(403).json({ success: false, message, error: message });
    }

    next();
  };
};
