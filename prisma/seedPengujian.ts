/**
 * Seed skenario alur pengujian QC yang saling berkorelasi:
 *   Permintaan → (Disetujui / Ditolak) → Sampling → Dalam Pengujian → Menunggu Review → Selesai / Revisi
 *
 * Seluruh langkah dijalankan MELALUI SERVICE ASLI dengan konteks pelaku yang sesuai aturan:
 *   admin      → membuat & menyetujui / menolak permintaan
 *   penguji    → menerima sampel, mengisi hasil, submit review (hanya metode yang ia kuasai)
 *   supervisor → mereview hasil (setujui / kembalikan revisi)
 * Dengan begitu riwayat, nomor dokumen, validasi, dan audit trail tercatat persis seperti di aplikasi.
 *
 * Idempoten: data hasil seed sebelumnya (catatan diawali "[SEED]") dihapus lalu dibuat ulang.
 * Prasyarat: master (batch produksi, parameter & metode uji, lookup QC) serta seed akses.
 *
 *   npm run seed:pengujian
 */
import prisma from '../src/utils/prisma';
import { runWithContext } from '../src/utils/requestContext';
import { permintaanPengujianService } from '../src/services/qc/permintaanPengujian.service';
import { pemeriksaanPengujianService } from '../src/services/qc/pemeriksaanPengujian.service';
import { evaluateHasil, parseBatasAcuan } from '../src/utils/batasAcuan';
import { permintaanPengujianRepository as repo } from '../src/repositories/permintaanPengujian.repository';
import { HASIL_AKHIR, QC_LOOKUP_KATEGORI as K } from '../src/constants/qc.constants';

const SEED_MARK = '[SEED]';

type Actor = { userId: string; username: string; roles: string[] };
type Tahap = 'menunggu' | 'ditolak' | 'sampling' | 'dalam-pengujian' | 'menunggu-review' | 'revisi' | 'selesai';

interface Skenario {
  tahap: Tahap;
  penguji: string; // username penguji yang mengerjakan (juga pengambil sampel)
  hasil?: 'Lulus' | 'Tidak Lulus';
  catatan: string;
}

/** Diurutkan menurut prioritas: bila batch yang tersedia kurang, skenario terakhir dilewati. */
const SKENARIO: Skenario[] = [
  { tahap: 'sampling', penguji: 'dewi', catatan: 'Sampel siap diambil di gudang pengolahan.' },
  { tahap: 'dalam-pengujian', penguji: 'dewi', catatan: 'Pengujian berjalan, sebagian parameter sudah diuji.' },
  { tahap: 'menunggu-review', penguji: 'ratna', hasil: 'Lulus', catatan: 'Semua parameter selesai diuji.' },
  { tahap: 'selesai', penguji: 'andi', hasil: 'Lulus', catatan: 'Batch memenuhi standar mutu.' },
  { tahap: 'selesai', penguji: 'rina', hasil: 'Tidak Lulus', catatan: 'Salah satu parameter di bawah standar.' },
  { tahap: 'revisi', penguji: 'budi', hasil: 'Lulus', catatan: 'Dikembalikan supervisor untuk pengecekan ulang.' },
  { tahap: 'menunggu', penguji: 'andi', catatan: 'Uji rutin batch baru, menunggu persetujuan QC.' },
  { tahap: 'ditolak', penguji: 'budi', catatan: 'Permintaan ganda untuk batch yang sama.' },
];

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const asActor = async (username: string): Promise<Actor> => {
  const user = await prisma.user.findUnique({ where: { username }, include: { roles: { include: { role: true } } } });
  if (!user) throw new Error(`User "${username}" tidak ditemukan — jalankan "npm run seed:akses" terlebih dahulu.`);
  return { userId: user.id, username: user.username, roles: user.roles.map((r) => r.role.name) };
};

/** Jalankan aksi service seolah-olah dilakukan oleh `actor` melalui aplikasi. */
const as = <T>(actor: Actor, fn: () => Promise<T>) =>
  runWithContext(
    { user: actor, ipAddress: '127.0.0.1', userAgent: 'Seeder', metode: 'SEED', endpoint: '/seed/pengujian', audited: false },
    fn
  );

const firstLookup = async (kategori: string) => {
  const row = await prisma.qcLookup.findFirst({ where: { kategori, status: 'Aktif' }, orderBy: { urutan: 'asc' } });
  if (!row) throw new Error(`Lookup ${kategori} kosong — jalankan "npm run seed:qc-lookup".`);
  return row.kode;
};

/** Nilai numerik yang menghasilkan status yang diinginkan terhadap batas acuan. */
const nilaiUntuk = (batas: string | null, target: string) => {
  const parsed = parseBatasAcuan(batas);
  if (!parsed) return null;
  const angka = (batas?.match(/-?\d+(?:[.,]\d+)?/g) || []).map((n) => Number(n.replace(',', '.')));
  const kandidat = angka.flatMap((n) => [n, n * 0.95, n * 1.05, n - 1, n + 1, n - 5, n + 5]).concat([0, 50, 100]);
  const found = kandidat.find((v) => v >= 0 && evaluateHasil(v, batas) === target);
  return found === undefined ? null : Math.round(found * 100) / 100;
};

async function hapusSeedLama() {
  const lama = await prisma.permintaanPengujian.findMany({ where: { catatan: { startsWith: SEED_MARK } }, select: { id: true } });
  const ids = lama.map((l) => l.id);
  if (!ids.length) return;
  await prisma.auditLog.deleteMany({ where: { entitasId: { in: ids } } });
  await prisma.permintaanPengujian.deleteMany({ where: { id: { in: ids } } });
  console.log(`  ↺ ${ids.length} data seed pengujian lama dihapus`);
}

export async function seedPengujian() {
  console.log('Seeding skenario alur pengujian...');
  await hapusSeedLama();

  const [admin, supervisor] = await Promise.all([asActor('admin'), asActor('supervisor')]);
  // Aturan bisnis: satu batch hanya boleh diajukan satu kali, jadi hanya batch yang belum diajukan yang dipakai.
  const batches = await repo.findAvailableBatches();
  if (!batches.length) throw new Error('Tidak ada batch produksi yang belum diajukan pengujian — jalankan seed produksi.');
  if (batches.length < SKENARIO.length) {
    console.warn(`  ⚠ Hanya ${batches.length} batch tersedia; ${SKENARIO.length - batches.length} skenario terakhir dilewati.`);
  }

  const lookup = {
    pemohon: await firstLookup(K.PEMOHON),
    prioritas: await firstLookup(K.PRIORITAS),
    satuanSampel: await firstLookup(K.SATUAN_SAMPEL),
    metodeSampling: await firstLookup(K.METODE_SAMPLING),
    kondisiSampel: await firstLookup(K.KONDISI_SAMPEL),
  };

  for (const [i, s] of SKENARIO.slice(0, batches.length).entries()) {
    const pengujiActor = await asActor(s.penguji);
    const penguji = await prisma.penguji.findUnique({
      where: { userId: pengujiActor.userId },
      include: { metodeUji: { select: { testMethodId: true } } },
    });
    if (!penguji || penguji.status !== 'Aktif') throw new Error(`Penguji ${s.penguji} tidak aktif`);

    // Parameter hanya dari metode yang dikuasai penguji → korelasi kompetensi terjaga.
    const parameters = await prisma.testParameter.findMany({
      where: { metodeId: { in: penguji.metodeUji.map((m) => m.testMethodId) }, status: 'Aktif' },
      take: 2,
      orderBy: { kode: 'asc' },
    });
    if (!parameters.length) {
      console.warn(`  ⚠ Lewati skenario ${s.tahap}: penguji ${s.penguji} belum punya parameter uji aktif`);
      continue;
    }

    const batch = batches[i]!;
    const created = await as(admin, () =>
      permintaanPengujianService.create(
        {
          tanggal: daysAgo(14 - i),
          batchProduksiId: batch.id,
          jumlahSampel: 500,
          satuanSampel: lookup.satuanSampel,
          metodeSampling: lookup.metodeSampling,
          pengambilSampelId: penguji.id,
          pemohon: lookup.pemohon,
          prioritas: lookup.prioritas,
          catatan: `${SEED_MARK} ${s.catatan}`,
          parameters: parameters.map((p) => ({ parameterId: p.id, checked: true })),
        },
        admin.username
      )
    );
    const id = created!.id;

    if (s.tahap === 'menunggu') continue;
    if (s.tahap === 'ditolak') {
      await as(admin, () => permintaanPengujianService.reject(id, admin.username, 'Batch ini sudah memiliki permintaan pengujian aktif.'));
      continue;
    }
    await as(admin, () => permintaanPengujianService.approve(id, admin.username, 'Disetujui untuk diuji.'));
    if (s.tahap === 'sampling') continue;

    await as(pengujiActor, () =>
      pemeriksaanPengujianService.terimaSampel(
        id,
        { tanggalSampling: daysAgo(10 - i), kondisiSampel: lookup.kondisiSampel, laboratoriumId: penguji.laboratoriumId },
        pengujiActor.username
      )
    );

    // Isi hasil: semua parameter, kecuali skenario "dalam pengujian" (hanya sebagian).
    const detail = await prisma.permintaanPengujian.findUniqueOrThrow({ where: { id }, include: { parameters: true } });
    const aktif = detail.parameters.filter((p) => p.checked);
    const diisi = s.tahap === 'dalam-pengujian' ? aktif.slice(0, 1) : aktif;
    const hasilParam = diisi.map((p, idx) => {
      // Untuk skenario Tidak Lulus, parameter terakhir dibuat gagal; lainnya lulus.
      const target = s.hasil === 'Tidak Lulus' && idx === diisi.length - 1 ? HASIL_AKHIR.TIDAK_LULUS : HASIL_AKHIR.LULUS;
      const nilai = nilaiUntuk(p.batasAcuan ?? p.standar, target);
      return nilai !== null
        ? { id: p.id, nilaiHasil: nilai, hasilTeks: null, statusHasil: null, catatanHasil: 'Diuji sesuai SOP.' }
        : { id: p.id, nilaiHasil: null, hasilTeks: target === HASIL_AKHIR.LULUS ? 'Sesuai' : 'Tidak sesuai', statusHasil: target, catatanHasil: 'Pengamatan visual.' };
    });
    await as(pengujiActor, () =>
      pemeriksaanPengujianService.simpanHasil(id, { parameters: hasilParam, catatanPengujian: s.catatan }, pengujiActor.username)
    );
    if (s.tahap === 'dalam-pengujian') continue;

    await as(pengujiActor, () => pemeriksaanPengujianService.submitReview(id, pengujiActor.username));
    if (s.tahap === 'menunggu-review') continue;

    if (s.tahap === 'revisi') {
      await as(supervisor, () =>
        pemeriksaanPengujianService.review(id, { keputusan: 'revisi', catatan: 'Mohon cek ulang kalibrasi alat sebelum disetujui.' }, supervisor.username)
      );
      continue;
    }
    await as(supervisor, () => pemeriksaanPengujianService.review(id, { keputusan: 'setujui', catatan: 'Hasil sesuai.' }, supervisor.username));
  }

  const total = await prisma.permintaanPengujian.count({ where: { catatan: { startsWith: SEED_MARK } } });
  console.log(`✔ ${total} skenario pengujian dibuat melalui alur aplikasi`);
}

if (require.main === module) {
  seedPengujian()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
