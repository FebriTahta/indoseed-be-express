import { AsyncLocalStorage } from 'async_hooks';

export interface RequestUser {
  userId: string;
  username: string;
  roles: string[];
  /** Diisi bila token diterbitkan lewat fitur "login sebagai" oleh superadmin. */
  impersonatedBy?: { userId: string; username: string };
}

/** Informasi request yang dibutuhkan lapisan service tanpa harus meneruskan `req` ke mana-mana. */
export interface RequestContext {
  user?: RequestUser;
  ipAddress?: string;
  userAgent?: string;
  metode: string;
  endpoint: string;
  /** Ditandai true bila service sudah mencatat audit spesifik, agar audit otomatis tidak dobel. */
  audited: boolean;
}

const storage = new AsyncLocalStorage<RequestContext>();

export const runWithContext = <T>(ctx: RequestContext, fn: () => T) => storage.run(ctx, fn);

export const getRequestContext = () => storage.getStore();
