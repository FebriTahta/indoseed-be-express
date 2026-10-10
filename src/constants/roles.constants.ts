export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  QC_SUPERVISOR: 'qc_supervisor',
  PENGUJI: 'penguji',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

/** Boleh mengelola master penguji (termasuk akun user-nya). */
export const PENGUJI_MANAGER_ROLES: RoleName[] = [ROLES.SUPERADMIN, ROLES.ADMIN];

/** Boleh mereview / menyetujui hasil dan memerintahkan uji ulang. */
export const REVIEWER_ROLES: RoleName[] = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.QC_SUPERVISOR];

type Rule = { method: string; path: RegExp };

const rule = (method: string, path: RegExp): Rule => ({ method, path });

/**
 * Role terbatas → daftar endpoint yang boleh diakses. User yang SEMUA role-nya terbatas hanya
 * boleh memanggil endpoint di sini; role lain (superadmin, admin, dst.) tidak dibatasi.
 * Penguji hanya mengelola pengujian: memeriksa sampel, mengisi hasil, dan melihat hasilnya.
 */
export const RESTRICTED_ROLE_ACCESS: Partial<Record<RoleName, Rule[]>> = {
  [ROLES.PENGUJI]: [
    rule('POST', /^\/api\/auth\/logout$/),
    rule('GET', /^\/api\/auth\/me$/),
    rule('POST', /^\/api\/auth\/impersonate\/stop$/),
    rule('GET', /^\/api\/settings(\/.*)?$/),
    rule('GET', /^\/api\/qc\/(meta|lookups|laboratoriums)$/),
    rule('GET', /^\/api\/master\/commodity$/), // referensi filter komoditas (read-only)
    rule('GET', /^\/api\/qc\/pemeriksaan(\/.*)?$/),
    rule('POST', /^\/api\/qc\/pemeriksaan\/[^/]+\/(terima-sampel|submit-review|dokumentasi)$/),
    rule('PUT', /^\/api\/qc\/pemeriksaan\/[^/]+\/hasil$/),
    rule('DELETE', /^\/api\/qc\/pemeriksaan\/[^/]+\/dokumentasi\/[^/]+$/),
    rule('GET', /^\/api\/qc\/hasil(\/.*)?$/),
    rule('GET', /^\/api\/files\/download$/), // unduh SOP / dokumen metode uji & dokumentasi
  ],
};

export const isRestrictedUser = (roles: string[] = []) =>
  roles.length > 0 && roles.every((r) => RESTRICTED_ROLE_ACCESS[r as RoleName]);

export const isAllowedForRoles = (roles: string[], method: string, path: string) =>
  roles.some((r) => RESTRICTED_ROLE_ACCESS[r as RoleName]?.some((x) => x.method === method && x.path.test(path)));
