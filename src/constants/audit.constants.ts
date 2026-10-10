export const AUDIT_AKSI = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
} as const;

export type AuditAksi = (typeof AUDIT_AKSI)[keyof typeof AUDIT_AKSI];

export const AUDIT_AKSI_LIST = Object.values(AUDIT_AKSI);

/** Nama modul untuk aktivitas autentikasi. */
export const AUDIT_MODUL_AUTH = 'Autentikasi';

/**
 * Pemetaan prefix endpoint → modul & entitas untuk audit otomatis (fallback bila service
 * tidak mencatat audit spesifik). Urutan penting: prefix yang lebih spesifik di atas.
 */
export const AUDIT_ROUTE_MAP: { prefix: string; modul: string; entitas: string }[] = [
  { prefix: '/api/qc/permintaan', modul: 'Permintaan Pengujian', entitas: 'Permintaan Pengujian' },
  { prefix: '/api/qc/pemeriksaan', modul: 'Pemeriksaan Pengujian', entitas: 'Pengujian' },
  { prefix: '/api/qc/penguji', modul: 'Penguji', entitas: 'Penguji' },
  { prefix: '/api/qc/methods', modul: 'Metode Uji', entitas: 'Metode Uji' },
  { prefix: '/api/qc/standards', modul: 'Standar Mutu', entitas: 'Standar Acuan' },
  { prefix: '/api/qc/parameters', modul: 'Metode Uji', entitas: 'Parameter Uji' },
  { prefix: '/api/qc/lookups', modul: 'Master Data', entitas: 'Lookup QC' },
  { prefix: '/api/qc/documents', modul: 'Dokumen QC', entitas: 'Dokumen' },
  { prefix: '/api/qc/tests', modul: 'Uji Laboratorium', entitas: 'Uji QC' },
  { prefix: '/api/master/laboratorium', modul: 'Laboratorium', entitas: 'Laboratorium' },
  { prefix: '/api/master/commodity', modul: 'Master Data', entitas: 'Komoditas' },
  { prefix: '/api/master/variety', modul: 'Master Data', entitas: 'Varietas' },
  { prefix: '/api/master/partner', modul: 'Master Data', entitas: 'Petani Mitra' },
  { prefix: '/api/master/customer', modul: 'Master Data', entitas: 'Customer' },
  { prefix: '/api/master/supplier', modul: 'Master Data', entitas: 'Supplier' },
  { prefix: '/api/master/greenhouse', modul: 'Master Data', entitas: 'Lahan & Greenhouse' },
  { prefix: '/api/master/user', modul: 'Pengguna', entitas: 'Pengguna' },
  { prefix: '/api/master', modul: 'Master Data', entitas: 'Master Data' },
  { prefix: '/api/produksi/batch-produksi', modul: 'Batch Produksi', entitas: 'Batch Produksi' },
  { prefix: '/api/produksi/jadwal-tanam', modul: 'Jadwal Tanam', entitas: 'Jadwal Tanam' },
  { prefix: '/api/produksi/panen', modul: 'Panen', entitas: 'Panen' },
  { prefix: '/api/produksi/perencanaan-produksi', modul: 'Perencanaan', entitas: 'Perencanaan Produksi' },
  { prefix: '/api/produksi', modul: 'Produksi', entitas: 'Produksi' },
  { prefix: '/api/gudang', modul: 'Gudang', entitas: 'Gudang' },
  { prefix: '/api/settings', modul: 'Pengaturan', entitas: 'Pengaturan' },
];

/** Endpoint mutasi yang tidak perlu diaudit otomatis (dicatat manual atau bukan perubahan data). */
export const AUDIT_SKIP_PREFIXES = ['/api/auth', '/api/upload', '/api/audit-trail'];
