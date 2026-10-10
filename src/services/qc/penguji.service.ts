import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../../utils/prisma';
import { conflict, notFound } from '../../utils/httpError';
import { ROLES } from '../../constants/roles.constants';
import { PERMINTAAN_STATUS } from '../../constants/qc.constants';
import { AUDIT_AKSI } from '../../constants/audit.constants';
import { recordAudit } from '../audit/audit.service';
import { diffFields } from '../audit/auditDiff';
import { PengujiInput, PengujiListQuery } from '../../validators/penguji.validator';

type Tx = Prisma.TransactionClient;

const MODUL = 'Penguji';
const KODE_PREFIX = 'PGJ-';
const HARI_AKAN_EXPIRED = 30;

const pengujiInclude = {
  laboratorium: { select: { id: true, kodeLaboratorium: true, namaLaboratorium: true } },
  user: { select: { id: true, username: true, email: true } },
  metodeUji: { include: { testMethod: { select: { id: true, kode: true, nama: true, jenisUji: true } } } },
  sertifikasi: { orderBy: { createdAt: 'desc' } },
} satisfies Prisma.PengujiInclude;

const AUDIT_LABELS = {
  kodePenguji: 'Kode Penguji',
  nama: 'Nama',
  email: 'Email',
  noTelepon: 'No. Telepon',
  laboratorium: 'Laboratorium',
  metodeUji: 'Metode Uji',
  tanggalBergabung: 'Tanggal Bergabung',
  berlakuHingga: 'Berlaku Hingga',
  status: 'Status',
  sertifikasi: 'Sertifikasi',
};

/** Password sementara yang mudah dibaca (tanpa karakter ambigu), dibagikan sekali ke penguji. */
const generatePassword = (length = 10) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  return Array.from(crypto.randomBytes(length), (b) => chars[b % chars.length]).join('');
};

const nextKodePenguji = async (tx: Tx) => {
  const rows = await tx.penguji.findMany({ where: { kodePenguji: { startsWith: KODE_PREFIX } }, select: { kodePenguji: true } });
  const max = rows.reduce((acc, r) => Math.max(acc, Number(r.kodePenguji.slice(KODE_PREFIX.length)) || 0), 0);
  return `${KODE_PREFIX}${String(max + 1).padStart(4, '0')}`;
};

/** Username dari bagian lokal email, dibuat unik dengan akhiran angka bila perlu. */
const uniqueUsername = async (tx: Tx, email: string) => {
  const base = (email.split('@')[0] || 'penguji').toLowerCase().replace(/[^a-z0-9._-]/g, '').slice(0, 30) || 'penguji';
  for (let i = 0; ; i++) {
    const candidate = i === 0 ? base : `${base}${i + 1}`;
    if (!(await tx.user.findUnique({ where: { username: candidate }, select: { id: true } }))) return candidate;
  }
};

const assertEmailAvailable = async (tx: Tx, email: string, exceptUserId?: string | null) => {
  const owner = await tx.user.findUnique({ where: { email }, select: { id: true } });
  if (owner && owner.id !== exceptUserId) throw conflict(`Email ${email} sudah digunakan oleh akun lain`);
};

const assertKodeAvailable = async (tx: Tx, kode: string, exceptId?: string) => {
  const owner = await tx.penguji.findUnique({ where: { kodePenguji: kode }, select: { id: true } });
  if (owner && owner.id !== exceptId) throw conflict(`Kode penguji ${kode} sudah digunakan`);
};

const assertReferences = async (tx: Tx, input: PengujiInput) => {
  const [lab, methodCount] = await Promise.all([
    tx.laboratorium.findUnique({ where: { id: input.laboratoriumId }, select: { id: true } }),
    tx.testMethod.count({ where: { id: { in: input.metodeUjiIds } } }),
  ]);
  if (!lab) throw notFound('Laboratorium tidak ditemukan');
  if (methodCount !== new Set(input.metodeUjiIds).size) throw notFound('Sebagian metode uji tidak ditemukan');
};

const pengujiData = (input: PengujiInput) => ({
  nama: input.nama,
  noTelepon: input.noTelepon ?? null,
  laboratoriumId: input.laboratoriumId,
  tanggalBergabung: input.tanggalBergabung,
  berlakuHingga: input.berlakuHingga ?? null,
  status: input.status,
  keterangan: input.keterangan ?? null,
  foto: input.foto ?? null,
});

const replaceRelations = async (tx: Tx, pengujiId: string, input: PengujiInput) => {
  await tx.pengujiTestMethod.deleteMany({ where: { pengujiId } });
  await tx.pengujiTestMethod.createMany({
    data: [...new Set(input.metodeUjiIds)].map((testMethodId) => ({ pengujiId, testMethodId })),
  });
  await tx.sertifikasi.deleteMany({ where: { pengujiId } });
  if (input.sertifikasi) {
    await tx.sertifikasi.create({
      data: {
        pengujiId,
        namaSertifikasi: input.sertifikasi.namaSertifikasi,
        nomorSertifikat: input.sertifikasi.nomorSertifikat ?? null,
        tanggalSertifikat: input.sertifikasi.tanggalSertifikat ?? null,
        berlakuHingga: input.berlakuHingga ?? null,
        lampiranUrl: input.sertifikasi.lampiranUrl ?? null,
      },
    });
  }
};

/** Ringkasan nilai untuk audit (relasi diringkas menjadi teks yang mudah dibaca). */
type PengujiDetail = Prisma.PengujiGetPayload<{ include: typeof pengujiInclude }>;
const auditSnapshot = (p: PengujiDetail) => ({
  kodePenguji: p.kodePenguji,
  nama: p.nama,
  email: p.user?.email ?? null,
  noTelepon: p.noTelepon,
  laboratorium: p.laboratorium?.namaLaboratorium ?? null,
  metodeUji: p.metodeUji.map((m) => m.testMethod.nama).sort().join(', '),
  tanggalBergabung: p.tanggalBergabung?.toISOString().slice(0, 10) ?? null,
  berlakuHingga: p.berlakuHingga?.toISOString().slice(0, 10) ?? null,
  status: p.status,
  sertifikasi: p.sertifikasi[0]?.namaSertifikasi ?? null,
});

const findDetail = (id: string, db: Tx | typeof prisma = prisma) =>
  db.penguji.findUnique({ where: { id }, include: pengujiInclude });

const getOrThrow = async (id: string, db: Tx | typeof prisma = prisma) => {
  const item = await findDetail(id, db);
  if (!item) throw notFound('Penguji tidak ditemukan');
  return item;
};

export const pengujiService = {
  list: async (q: PengujiListQuery) => {
    const page = q.page || 1;
    const pageSize = q.pageSize || q.limit || 10;
    const and: Prisma.PengujiWhereInput[] = [];
    if (q.status) and.push({ status: q.status });
    if (q.laboratoriumId) and.push({ laboratoriumId: q.laboratoriumId });
    if (q.testMethodId) and.push({ metodeUji: { some: { testMethodId: q.testMethodId } } });
    if (q.search) {
      and.push({
        OR: [
          { nama: { contains: q.search } },
          { kodePenguji: { contains: q.search } },
          { user: { is: { email: { contains: q.search } } } },
        ],
      });
    }
    const where = and.length ? { AND: and } : {};
    const [total, data] = await prisma.$transaction([
      prisma.penguji.count({ where }),
      prisma.penguji.findMany({
        where,
        include: pengujiInclude,
        orderBy: { kodePenguji: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { data, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  stats: async () => {
    const now = new Date();
    const batas = new Date(now.getTime() + HARI_AKAN_EXPIRED * 24 * 60 * 60 * 1000);
    const [total, aktif, bersertifikat, akanExpired] = await Promise.all([
      prisma.penguji.count(),
      prisma.penguji.count({ where: { status: 'Aktif' } }),
      prisma.penguji.count({ where: { sertifikasi: { some: {} } } }),
      prisma.penguji.count({ where: { status: 'Aktif', berlakuHingga: { gte: now, lte: batas } } }),
    ]);
    return { total, aktif, nonaktif: total - aktif, bersertifikat, akanExpired, hariAkanExpired: HARI_AKAN_EXPIRED };
  },

  getById: (id: string) => getOrThrow(id),

  /** Buat penguji sekaligus akun user ber-role penguji. Password sementara dikembalikan sekali. */
  create: async (input: PengujiInput) => {
    const passwordSementara = generatePassword();
    const passwordHash = await bcrypt.hash(passwordSementara, 10);

    const { id, username } = await prisma.$transaction(async (tx) => {
      await assertReferences(tx, input);
      await assertEmailAvailable(tx, input.email);
      const kodePenguji = input.kodePenguji || (await nextKodePenguji(tx));
      await assertKodeAvailable(tx, kodePenguji);

      const role = await tx.role.upsert({ where: { name: ROLES.PENGUJI }, update: {}, create: { name: ROLES.PENGUJI } });
      const user = await tx.user.create({
        data: {
          username: await uniqueUsername(tx, input.email),
          email: input.email,
          password: passwordHash,
          isEmailVerified: true,
          defaultRoleId: role.id,
          roles: { create: { roleId: role.id } },
        },
      });
      const penguji = await tx.penguji.create({ data: { ...pengujiData(input), kodePenguji, userId: user.id } });
      await replaceRelations(tx, penguji.id, input);

      await recordAudit(
        {
          modul: MODUL,
          aksi: AUDIT_AKSI.CREATE,
          entitas: 'Penguji',
          entitasId: penguji.id,
          entitasKode: kodePenguji,
          keterangan: `Menambahkan penguji ${input.nama} beserta akun ${user.username}`,
        },
        tx
      );
      return { id: penguji.id, username: user.username };
    });

    return { penguji: await getOrThrow(id), akun: { username, email: input.email, passwordSementara } };
  },

  update: async (id: string, input: PengujiInput) => {
    const before = await getOrThrow(id);
    if (before.status === 'Aktif' && input.status === 'Nonaktif') {
      // Pengujian yang sedang dikerjakan akan yatim bila penguji dinonaktifkan.
      const aktif = await prisma.permintaanPengujian.count({
        where: { petugasQcId: id, status: PERMINTAAN_STATUS.DALAM_PENGUJIAN },
      });
      if (aktif) throw conflict(`Penguji masih mengerjakan ${aktif} pengujian. Selesaikan atau kembalikan pengujian tersebut sebelum menonaktifkan.`);
    }
    let akunBaru: { username: string; email: string; passwordSementara: string } | null = null;

    await prisma.$transaction(async (tx) => {
      await assertReferences(tx, input);
      await assertEmailAvailable(tx, input.email, before.userId);
      const kodePenguji = input.kodePenguji || before.kodePenguji;
      await assertKodeAvailable(tx, kodePenguji, id);

      let userId = before.userId;
      if (userId) {
        await tx.user.update({ where: { id: userId }, data: { email: input.email } });
      } else {
        // Data lama tanpa akun: buatkan akun agar penguji dapat login.
        const passwordSementara = generatePassword();
        const role = await tx.role.upsert({ where: { name: ROLES.PENGUJI }, update: {}, create: { name: ROLES.PENGUJI } });
        const user = await tx.user.create({
          data: {
            username: await uniqueUsername(tx, input.email),
            email: input.email,
            password: await bcrypt.hash(passwordSementara, 10),
            isEmailVerified: true,
            defaultRoleId: role.id,
            roles: { create: { roleId: role.id } },
          },
        });
        userId = user.id;
        akunBaru = { username: user.username, email: input.email, passwordSementara };
      }

      await tx.penguji.update({ where: { id }, data: { ...pengujiData(input), kodePenguji, userId } });
      await replaceRelations(tx, id, input);

      const after = await getOrThrow(id, tx);
      await recordAudit(
        {
          modul: MODUL,
          aksi: AUDIT_AKSI.UPDATE,
          entitas: 'Penguji',
          entitasId: id,
          entitasKode: kodePenguji,
          keterangan: `Memperbarui data penguji ${input.nama}`,
          perubahan: diffFields(auditSnapshot(before), auditSnapshot(after), AUDIT_LABELS),
        },
        tx
      );
    });

    return { penguji: await getOrThrow(id), akun: akunBaru };
  },

  /** Penguji yang sudah punya riwayat pengujian tidak boleh dihapus — cukup dinonaktifkan. */
  delete: async (id: string) => {
    const penguji = await prisma.penguji.findUnique({
      where: { id },
      include: {
        user: { include: { roles: { include: { role: true } } } },
        _count: { select: { qcTests: true, permintaanSebagaiPetugas: true, permintaanSebagaiPengambil: true } },
      },
    });
    if (!penguji) throw notFound('Penguji tidak ditemukan');
    const { qcTests, permintaanSebagaiPetugas, permintaanSebagaiPengambil } = penguji._count;
    if (qcTests || permintaanSebagaiPetugas || permintaanSebagaiPengambil) {
      throw conflict('Penguji sudah memiliki riwayat pengujian. Ubah statusnya menjadi Nonaktif alih-alih menghapus.');
    }
    // Akun ikut dihapus hanya bila akun tersebut murni akun penguji.
    const hapusAkun = penguji.user && penguji.user.roles.every((r) => r.role.name === ROLES.PENGUJI);

    await prisma.$transaction(async (tx) => {
      await tx.penguji.delete({ where: { id } });
      if (hapusAkun && penguji.userId) await tx.user.delete({ where: { id: penguji.userId } });
      await recordAudit(
        {
          modul: MODUL,
          aksi: AUDIT_AKSI.DELETE,
          entitas: 'Penguji',
          entitasId: id,
          entitasKode: penguji.kodePenguji,
          keterangan: `Menghapus penguji ${penguji.nama}${hapusAkun ? ` beserta akun ${penguji.user?.username}` : ''}`,
        },
        tx
      );
    });
  },

  /** Terbitkan password sementara baru untuk akun penguji. */
  resetPassword: async (id: string) => {
    const penguji = await prisma.penguji.findUnique({ where: { id }, include: { user: true } });
    if (!penguji) throw notFound('Penguji tidak ditemukan');
    if (!penguji.user) throw notFound('Penguji ini belum memiliki akun user');

    const passwordSementara = generatePassword();
    await prisma.user.update({ where: { id: penguji.user.id }, data: { password: await bcrypt.hash(passwordSementara, 10) } });
    await recordAudit({
      modul: MODUL,
      aksi: AUDIT_AKSI.UPDATE,
      entitas: 'Akun Penguji',
      entitasId: penguji.id,
      entitasKode: penguji.kodePenguji,
      keterangan: `Mereset password akun ${penguji.user.username}`,
    });
    return { username: penguji.user.username, email: penguji.user.email, passwordSementara };
  },
};
