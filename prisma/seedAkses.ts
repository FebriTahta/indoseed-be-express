/**
 * Seed role, akun pengguna inti, laboratorium, dan penguji (beserta akun login-nya).
 * Idempoten: aman dijalankan berulang (upsert berdasarkan username / kode / userId).
 *
 *   npm run seed:akses        → hanya bagian ini
 *   npm run seed              → seluruh seeder (memanggil fungsi di file ini)
 *
 * Aturan akses yang dicerminkan:
 *   superadmin    → seluruh fitur + "login sebagai" user lain
 *   admin         → seluruh fitur operasional, termasuk kelola penguji
 *   qc_supervisor → mereview / menyetujui hasil pengujian
 *   penguji       → hanya Pemeriksaan / Pengujian dan Hasil Pengujian miliknya
 *
 * Catatan: metode uji (MT-xxx) harus sudah ada agar relasi metode penguji terisi,
 * sehingga di seed utama fungsi `seedPenguji` dijalankan setelah `seedQC`.
 */
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import prisma from '../src/utils/prisma';
import { ROLES } from '../src/constants/roles.constants';

type Db = PrismaClient;

const DEFAULT_PASSWORD = {
  superadmin: 'superadmin',
  admin: 'admin123',
  supervisor: 'supervisor123',
  penguji: 'penguji123',
};

const upsertRole = (db: Db, name: string) => db.role.upsert({ where: { name }, update: {}, create: { name } });

/** Buat user bila belum ada, dan pastikan role-nya terpasang (tanpa menimpa password yang sudah diganti). */
const upsertUser = async (db: Db, data: { username: string; email: string; password: string; role: string }) => {
  const role = await upsertRole(db, data.role);
  const user = await db.user.upsert({
    where: { username: data.username },
    update: { isEmailVerified: true },
    create: {
      username: data.username,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
      isEmailVerified: true,
      defaultRoleId: role.id,
    },
  });
  await db.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: role.id } },
    update: {},
    create: { userId: user.id, roleId: role.id },
  });
  if (!user.defaultRoleId) await db.user.update({ where: { id: user.id }, data: { defaultRoleId: role.id } });
  return user;
};

export async function seedRolesAndUsers(db: Db = prisma) {
  console.log('Seeding role & akun inti...');
  await Promise.all(Object.values(ROLES).map((name) => upsertRole(db, name)));

  await upsertUser(db, { username: 'superadmin', email: 'superadmin@example.com', password: DEFAULT_PASSWORD.superadmin, role: ROLES.SUPERADMIN });
  await upsertUser(db, { username: 'admin', email: 'admin@example.com', password: DEFAULT_PASSWORD.admin, role: ROLES.ADMIN });
  await upsertUser(db, { username: 'supervisor', email: 'supervisor.qc@example.com', password: DEFAULT_PASSWORD.supervisor, role: ROLES.QC_SUPERVISOR });
}

const LABORATORIUM = [
  {
    kodeLaboratorium: 'LAB-01',
    namaLaboratorium: 'Laboratorium Pusat Uji Benih',
    deskripsi: 'Laboratorium utama untuk pengujian benih inti',
    alamat: 'Jl. Ahmad Yani No. 100, Surabaya',
    telepon: '031-1234567',
    nomorAkreditasi: 'KAN-LP-001-IDN',
    lembagaAkreditasi: 'Komite Akreditasi Nasional',
    tanggalAkreditasi: new Date('2024-01-15'),
    tanggalBerlakuAkreditasi: new Date('2029-01-15'),
    ruangLingkupPengujian: 'Pengujian Mutu Fisik dan Fisiologis Benih',
    status: 'Aktif',
  },
  {
    kodeLaboratorium: 'LAB-02',
    namaLaboratorium: 'Laboratorium Tanah & Air',
    deskripsi: 'Laboratorium untuk pengujian sampel tanah dan air irigasi',
    alamat: 'Gedung B Lantai 2, Kompleks Pertanian',
    telepon: '031-7654321',
    nomorAkreditasi: 'KAN-LP-002-IDN',
    lembagaAkreditasi: 'Komite Akreditasi Nasional',
    tanggalAkreditasi: new Date('2023-05-10'),
    tanggalBerlakuAkreditasi: new Date('2028-05-10'),
    ruangLingkupPengujian: 'Pengujian Kesuburan Tanah dan Kualitas Air',
    status: 'Aktif',
  },
];

type PengujiSeed = {
  username: string;
  email: string;
  kodePenguji: string;
  nama: string;
  lab: 'LAB-01' | 'LAB-02';
  noTelepon: string;
  tanggalBergabung: string;
  /** Relatif terhadap hari ini (hari); null = tanpa batas. */
  berlakuHari: number | null;
  status: 'Aktif' | 'Nonaktif';
  methods: string[];
  sertifikasi?: { namaSertifikasi: string; nomorSertifikat: string; tanggalSertifikat: string };
};

const PENGUJI: PengujiSeed[] = [
  { username: 'dewi', email: 'dewi.lestari@example.com', kodePenguji: 'PGJ-0001', nama: 'Dewi Lestari', lab: 'LAB-01', noTelepon: '081234560001', tanggalBergabung: '2023-02-01', berlakuHari: 240, status: 'Aktif', methods: ['MT-003', 'MT-001'], sertifikasi: { namaSertifikasi: 'ISTA', nomorSertifikat: 'ISTA/ANL/2023/0101', tanggalSertifikat: '2023-03-10' } },
  { username: 'budi', email: 'budi.santoso@example.com', kodePenguji: 'PGJ-0002', nama: 'Budi Santoso', lab: 'LAB-01', noTelepon: '081234560002', tanggalBergabung: '2022-08-15', berlakuHari: 180, status: 'Aktif', methods: ['MT-002', 'MT-005'], sertifikasi: { namaSertifikasi: 'ISTA', nomorSertifikat: 'ISTA/ANL/2022/0412', tanggalSertifikat: '2022-09-01' } },
  { username: 'ratna', email: 'ratna.sari@example.com', kodePenguji: 'PGJ-0003', nama: 'Ratna Sari', lab: 'LAB-01', noTelepon: '081234560003', tanggalBergabung: '2023-06-05', berlakuHari: 20, status: 'Aktif', methods: ['MT-004', 'MT-003'], sertifikasi: { namaSertifikasi: 'ISO 17025', nomorSertifikat: 'KAN/17025/2023/077', tanggalSertifikat: '2023-07-20' } },
  { username: 'andi', email: 'andi.pratama@example.com', kodePenguji: 'PGJ-0004', nama: 'Andi Pratama', lab: 'LAB-01', noTelepon: '081234560004', tanggalBergabung: '2024-01-10', berlakuHari: 300, status: 'Aktif', methods: ['MT-009', 'MT-001', 'MT-002'], sertifikasi: { namaSertifikasi: 'ISTA', nomorSertifikat: 'ISTA/ANL/2024/0033', tanggalSertifikat: '2024-02-14' } },
  { username: 'siti', email: 'siti.nurhaliza@example.com', kodePenguji: 'PGJ-0005', nama: 'Siti Nurhaliza', lab: 'LAB-01', noTelepon: '081234560005', tanggalBergabung: '2024-03-01', berlakuHari: 12, status: 'Aktif', methods: ['MT-008', 'MT-006'], sertifikasi: { namaSertifikasi: 'ISTA', nomorSertifikat: 'ISTA/ANL/2024/0098', tanggalSertifikat: '2024-04-02' } },
  { username: 'rina', email: 'rina.wulandari@example.com', kodePenguji: 'PGJ-0006', nama: 'Rina Wulandari', lab: 'LAB-01', noTelepon: '081234560006', tanggalBergabung: '2024-05-20', berlakuHari: 400, status: 'Aktif', methods: ['MT-007', 'MT-004'], sertifikasi: { namaSertifikasi: 'ISO 17025', nomorSertifikat: 'KAN/17025/2024/015', tanggalSertifikat: '2024-06-11' } },
  { username: 'dedi', email: 'dedi.kurniawan@example.com', kodePenguji: 'PGJ-0007', nama: 'Dedi Kurniawan', lab: 'LAB-01', noTelepon: '081234560007', tanggalBergabung: '2024-07-01', berlakuHari: null, status: 'Aktif', methods: ['MT-005', 'MT-002'] },
  { username: 'maya', email: 'maya.lestari@example.com', kodePenguji: 'PGJ-0008', nama: 'Maya Lestari', lab: 'LAB-02', noTelepon: '081234560008', tanggalBergabung: '2023-11-11', berlakuHari: 150, status: 'Aktif', methods: ['MT-010', 'MT-011'], sertifikasi: { namaSertifikasi: 'ISO 17025', nomorSertifikat: 'KAN/17025/2023/120', tanggalSertifikat: '2023-12-01' } },
  { username: 'fajar', email: 'fajar.nugroho@example.com', kodePenguji: 'PGJ-0009', nama: 'Fajar Nugroho', lab: 'LAB-02', noTelepon: '081234560009', tanggalBergabung: '2022-04-04', berlakuHari: null, status: 'Nonaktif', methods: ['MT-003', 'MT-002'] },
];

const addDays = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};

export async function seedPenguji(db: Db = prisma) {
  console.log('Seeding laboratorium & penguji...');
  const labIds: Record<string, string> = {};
  for (const lab of LABORATORIUM) {
    const saved = await db.laboratorium.upsert({ where: { kodeLaboratorium: lab.kodeLaboratorium }, update: lab, create: lab });
    labIds[lab.kodeLaboratorium] = saved.id;
  }

  const methods = await db.testMethod.findMany({ select: { id: true, kode: true } });
  const methodIds = new Map(methods.map((m) => [m.kode, m.id]));
  if (!methods.length) console.warn('  ⚠ Metode uji belum ada — jalankan seed QC terlebih dahulu agar metode penguji terisi.');

  for (const p of PENGUJI) {
    const user = await upsertUser(db, { username: p.username, email: p.email, password: DEFAULT_PASSWORD.penguji, role: ROLES.PENGUJI });
    const berlakuHingga = p.berlakuHari === null ? null : addDays(p.berlakuHari);
    const data = {
      kodePenguji: p.kodePenguji,
      nama: p.nama,
      laboratoriumId: labIds[p.lab],
      noTelepon: p.noTelepon,
      tanggalBergabung: new Date(p.tanggalBergabung),
      berlakuHingga,
      status: p.status,
    };
    // Kunci upsert pada userId agar data lama (kode PENG-xxx) diperbarui, bukan diduplikasi.
    const penguji = await db.penguji.upsert({ where: { userId: user.id }, update: data, create: { ...data, userId: user.id } });

    const ids = p.methods.map((kode) => methodIds.get(kode)).filter((id): id is string => Boolean(id));
    await db.pengujiTestMethod.deleteMany({ where: { pengujiId: penguji.id } });
    if (ids.length) await db.pengujiTestMethod.createMany({ data: ids.map((testMethodId) => ({ pengujiId: penguji.id, testMethodId })) });

    await db.sertifikasi.deleteMany({ where: { pengujiId: penguji.id } });
    if (p.sertifikasi) {
      await db.sertifikasi.create({
        data: {
          pengujiId: penguji.id,
          namaSertifikasi: p.sertifikasi.namaSertifikasi,
          nomorSertifikat: p.sertifikasi.nomorSertifikat,
          tanggalSertifikat: new Date(p.sertifikasi.tanggalSertifikat),
          berlakuHingga,
        },
      });
    }
  }
  console.log(`✔ ${PENGUJI.length} penguji tersedia (password awal akun penguji: ${DEFAULT_PASSWORD.penguji})`);
}

if (require.main === module) {
  (async () => {
    await seedRolesAndUsers();
    await seedPenguji();
  })()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
