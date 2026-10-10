/**
 * Backfill data Permintaan Pengujian lama agar terhubung dengan relasi baru:
 * - pengambilSampel (teks) → pengambilSampelId (tabel penguji)
 * - parameter permintaan tanpa parameterId/metodeId → ditautkan ke master bila namanya unik
 * - batasAcuan parameter diisi dari master / teks standar
 * - permintaan yang sudah masuk tahap pemeriksaan diberi noPengujian & noSampel
 * - riwayat awal "Permintaan dibuat" untuk data tanpa riwayat
 *
 * Idempoten: hanya mengisi kolom yang masih kosong.
 *   npm run backfill:qc
 */
import prisma from '../src/utils/prisma';
import { permintaanPengujianRepository as repo } from '../src/repositories/permintaanPengujian.repository';
import { PEMERIKSAAN_STATUSES, QC_NUMBER_PREFIX, rekomendasiDari } from '../src/constants/qc.constants';

const norm = (s?: string | null) => (s || '').replace(/\(.*?\)/g, '').trim().toLowerCase();

async function main() {
  const pengujis = await prisma.penguji.findMany({ select: { id: true, nama: true } });
  const masters = await prisma.testParameter.findMany({ select: { id: true, nama: true, metodeId: true, batasAcuan: true } });
  const mastersByName = new Map<string, typeof masters>();
  masters.forEach((m) => mastersByName.set(norm(m.nama), [...(mastersByName.get(norm(m.nama)) || []), m]));

  const permintaans = await prisma.permintaanPengujian.findMany({
    include: { parameters: true, _count: { select: { riwayat: true } } },
    orderBy: { createdAt: 'asc' },
  });

  let linkedPengambil = 0;
  let linkedParam = 0;
  let numbered = 0;
  let riwayat = 0;

  for (const p of permintaans) {
    const data: Record<string, unknown> = {};

    if (!p.pengambilSampelId && p.pengambilSampel) {
      const key = norm(p.pengambilSampel);
      const matches = pengujis.filter((g) => norm(g.nama) === key || norm(g.nama).startsWith(`${key} `));
      if (matches.length === 1) {
        data.pengambilSampelId = matches[0]!.id;
        data.pengambilSampel = matches[0]!.nama;
        linkedPengambil++;
      }
    }

    if (PEMERIKSAAN_STATUSES.includes(p.status as any) && p.status !== 'Sampling') {
      if (!p.noPengujian) data.noPengujian = await repo.generateNumber('noPengujian', QC_NUMBER_PREFIX.PENGUJIAN);
      if (!p.noSampel) data.noSampel = await repo.generateNumber('noSampel', QC_NUMBER_PREFIX.SAMPEL);
      if (!p.tanggalSampling) data.tanggalSampling = p.tanggal;
      if (data.noPengujian) numbered++;
    }

    const rekomendasi = rekomendasiDari(p.hasilAkhir);
    if (rekomendasi && p.rekomendasi !== rekomendasi) data.rekomendasi = rekomendasi;

    if (Object.keys(data).length) {
      await prisma.permintaanPengujian.update({ where: { id: p.id }, data });
    }

    for (const param of p.parameters) {
      const update: Record<string, unknown> = {};
      let master = param.parameterId ? masters.find((m) => m.id === param.parameterId) : undefined;
      if (!master) {
        const candidates = mastersByName.get(norm(param.nama)) || [];
        if (candidates.length === 1) {
          master = candidates[0];
          update.parameterId = master!.id;
          linkedParam++;
        }
      }
      if (!param.metodeId && master?.metodeId) update.metodeId = master.metodeId;
      if (!param.batasAcuan) update.batasAcuan = master?.batasAcuan || param.standar;
      if (Object.keys(update).length) {
        await prisma.permintaanPengujianParameter.update({ where: { id: param.id }, data: update });
      }
    }

    if (p._count.riwayat === 0) {
      await prisma.permintaanPengujianRiwayat.create({
        data: {
          permintaanId: p.id,
          aksi: 'Permintaan dibuat',
          statusKe: p.status,
          keterangan: 'Data sebelum fitur riwayat diterapkan',
          oleh: p.dibuatOleh || 'Sistem',
          createdAt: p.createdAt,
        },
      });
      riwayat++;
    }
  }

  console.log(
    `✔ Backfill selesai: ${linkedPengambil} pengambil sampel, ${linkedParam} parameter tertaut, ` +
      `${numbered} nomor pengujian, ${riwayat} riwayat awal`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
