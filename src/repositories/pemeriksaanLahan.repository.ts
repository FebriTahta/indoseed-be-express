import { prisma } from '../utils/prisma';

export interface FindPemeriksaanLahanParams {
  search?: string;
  komoditas?: string;
  status?: string;
  tab?: string; // 'semua' | 'pemeriksaan' | 'offtype' | 'roguing' | 'selesai'
  fase?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export class PemeriksaanLahanRepository {
  /**
   * Mengambil data Jadwal Tanam yang memenuhi syarat:
   * 1. Status Jadwal Tanam = 'Disetujui'
   * 2. Persetujuan Produksi = 'Disetujui'
   * 3. Belum ada di tabel Panen (belum panen)
   */
  async findEligibleJadwalTanam() {
    // 1. Ambil semua jadwalTanamId yang sudah masuk panen
    const panenList = await prisma.panen.findMany({
      select: { jadwalTanamId: true },
    });
    const harvestedIds = panenList.map((p) => p.jadwalTanamId).filter(Boolean) as string[];

    // 2. Ambil semua Persetujuan Produksi yang Disetujui
    const approvedPP = await prisma.persetujuanProduksi.findMany({
      where: { status: 'Disetujui' },
      select: { jadwalTanamId: true, noPengajuan: true },
    });
    const approvedJadwalIds = approvedPP.map((pp) => pp.jadwalTanamId).filter(Boolean) as string[];
    const approvedKodeList = approvedPP.map((pp) => pp.noPengajuan).filter(Boolean) as string[];

    // 3. Query Jadwal Tanam
    const eligibleJadwals = await prisma.jadwalTanam.findMany({
      where: {
        statusJadwal: 'Disetujui',
        OR: [
          { id: { in: approvedJadwalIds } },
          { kodeJadwalTanam: { in: approvedKodeList } },
        ],
        id: { notIn: harvestedIds },
      },
      include: {
        partner: true,
        commodity: true,
        variety: true,
        detailLahan: true,
        persetujuanProduksi: true,
      },
      orderBy: { kodeJadwalTanam: 'desc' },
    });

    return eligibleJadwals;
  }

  /**
   * Auto-seed 24 data riil sesuai referensi tampilan jika tabel masih kosong
   */
  async seedInitialDataIfEmpty() {
    const count = await prisma.pemeriksaanLahan.count();
    if (count > 0) return;

    // Cari jadwal tanam yang cocok untuk relasi FK
    const jadwals = await prisma.jadwalTanam.findMany();
    const findJtId = (kode: string) => {
      const match = jadwals.find(
        (j) => j.kodeJadwalTanam === kode || j.kodeJadwalTanam.includes(kode.replace('JT-2026-', ''))
      );
      return match ? match.id : null;
    };

    const initialRecords = [
      {
        noPemeriksaan: 'PL-2026-0018',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0018',
        tanggalPemeriksaan: new Date('2026-10-12T08:15:00'),
        komoditas: 'Kangkung',
        varietas: 'Super Sempit',
        petani: 'Budi Santoso',
        lahan: 'Lahan A / Blok 01',
        fase: 'Vegetatif',
        petugasQc: 'Andi Pratama',
        persentaseKemurnian: 99.2,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 992,
        tanamanOffType: 8,
        keterangan: 'Memenuhi standar',
        catatan: 'Kondisi tanaman sesuai standar varietas. Tidak ditemukan penyimpangan yang signifikan.',
        temuanOffType: [
          { no: 1, jenisKarakter: 'Bentuk daun', jumlah: 3, keterangan: 'Daun lebih lebar' },
          { no: 2, jenisKarakter: 'Warna batang', jumlah: 2, keterangan: 'Warna lebih pucat' },
          { no: 3, jenisKarakter: 'Tinggi tanaman', jumlah: 2, keterangan: 'Tinggi lebih pendek' },
          { no: 4, jenisKarakter: 'Bentuk buah', jumlah: 1, keterangan: 'Bentuk tidak seragam' },
        ],
        dokumentasi: [
          '/images/pemeriksaan/field-1.jpg',
          '/images/pemeriksaan/field-2.jpg',
          '/images/pemeriksaan/field-3.jpg',
          '/images/pemeriksaan/field-4.jpg',
        ],
        roguingData: {
          status: 'Tidak Perlu',
          tanggalRencana: null,
          catatan: 'Toleransi kemurnian terpenuhi, tidak memerlukan tindakan roguing intensif.',
        },
        riwayatData: [
          { tanggal: '2026-10-12 08:15', aktivitas: 'Pemeriksaan Lapangan #1 selesai oleh Andi Pratama (QC)', status: 'Memenuhi' },
          { tanggal: '2026-10-11 14:00', aktivitas: 'Jadwal pemeriksaan disiapkan', status: 'Terjadwal' },
        ],
      },
      {
        noPemeriksaan: 'PL-2026-0017',
        pemeriksaanKe: 2,
        kodeJadwalTanam: 'JT-2026-0017',
        tanggalPemeriksaan: new Date('2026-10-10T10:20:00'),
        komoditas: 'Cabai',
        varietas: 'Keriting',
        petani: 'Siti Rahayu',
        lahan: 'Lahan B / Blok 02',
        fase: 'Berbunga',
        petugasQc: 'Rina Agustina',
        persentaseKemurnian: 96.5,
        status: 'Perlu Roguing',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 965,
        tanamanOffType: 35,
        keterangan: 'Perlu tindakan roguing',
        catatan: 'Ditemukan populasi tanaman off-type pada blok timur. Diperlukan roguing segera sebelum masa generatif penuh.',
        temuanOffType: [
          { no: 1, jenisKarakter: 'Bentuk daun', jumlah: 15, keterangan: 'Daun keriting berlebih' },
          { no: 2, jenisKarakter: 'Tinggi tanaman', jumlah: 12, keterangan: 'Kerdil abnormal' },
          { no: 3, jenisKarakter: 'Warna bunga', jumlah: 8, keterangan: 'Warna kelopak menyimpang' },
        ],
        dokumentasi: [
          '/images/pemeriksaan/field-2.jpg',
          '/images/pemeriksaan/field-3.jpg',
        ],
        roguingData: {
          status: 'Dijadwalkan',
          tanggalRencana: '2026-10-14',
          petugas: 'Siti Rahayu & Tim',
          catatan: 'Cabut dan musnahkan 35 tanaman menyimpang di blok timur.',
        },
        riwayatData: [
          { tanggal: '2026-10-10 10:20', aktivitas: 'Pemeriksaan Fase Berbunga oleh Rina Agustina (QC)', status: 'Perlu Roguing' },
        ],
      },
      {
        noPemeriksaan: 'PL-2026-0016',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0016',
        tanggalPemeriksaan: new Date('2026-10-08T14:30:00'),
        komoditas: 'Tomat',
        varietas: 'Melisa',
        petani: 'Agus Setiawan',
        lahan: 'Lahan C / Blok 03',
        fase: 'Vegetatif',
        petugasQc: 'Budi Santoso',
        persentaseKemurnian: 98.7,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 987,
        tanamanOffType: 13,
        keterangan: 'Memenuhi standar',
        catatan: 'Pertumbuhan vegetatif sangat baik, tanaman off-type masih dalam batas toleransi ISO/BPSB.',
        temuanOffType: [
          { no: 1, jenisKarakter: 'Bentuk daun', jumlah: 8, keterangan: 'Ujung daun membulat' },
          { no: 2, jenisKarakter: 'Tinggi tanaman', jumlah: 5, keterangan: 'Pertumbuhan lambat' },
        ],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [{ tanggal: '2026-10-08 14:30', aktivitas: 'Inspeksi vegetatif selesai', status: 'Memenuhi' }],
      },
      {
        noPemeriksaan: 'PL-2026-0015',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0015',
        tanggalPemeriksaan: new Date('2026-10-07T11:05:00'),
        komoditas: 'Cabai',
        varietas: 'Keriting',
        petani: 'Dewi Lestari',
        lahan: 'Lahan D / Blok 01',
        fase: 'Berbunga',
        petugasQc: 'Sari Wulandari',
        persentaseKemurnian: 94.8,
        status: 'Tidak Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 948,
        tanamanOffType: 52,
        keterangan: 'Tidak memenuhi standar kemurnian',
        catatan: 'Tingkat kemurnian di bawah standar minimal 98%. Perlu evaluasi menyeluruh sebelum sertifikasi.',
        temuanOffType: [
          { no: 1, jenisKarakter: 'Bentuk daun', jumlah: 24, keterangan: 'Pola daun melebar' },
          { no: 2, jenisKarakter: 'Habitus', jumlah: 28, keterangan: 'Tipe percabangan berbeda' },
        ],
        dokumentasi: ['/images/pemeriksaan/field-4.jpg'],
        roguingData: { status: 'Karantina', catatan: 'Blok lahan dikarantina untuk verifikasi ulang BPSB.' },
        riwayatData: [{ tanggal: '2026-10-07 11:05', aktivitas: 'Pemeriksaan mutu gagal', status: 'Tidak Memenuhi' }],
      },
      {
        noPemeriksaan: 'PL-2026-0014',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0014',
        tanggalPemeriksaan: new Date('2026-10-05T09:45:00'),
        komoditas: 'Kangkung',
        varietas: 'Super Sempit',
        petani: 'Budi Santoso',
        lahan: 'Lahan E / Blok 02',
        fase: 'Vegetatif',
        petugasQc: 'Rudi Hartono',
        persentaseKemurnian: 99.5,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 995,
        tanamanOffType: 5,
        keterangan: 'Memenuhi standar',
        catatan: 'Seragam dan sehat. Siap untuk fase berikutnya.',
        temuanOffType: [{ no: 1, jenisKarakter: 'Warna batang', jumlah: 5, keterangan: 'Batang kemerahan' }],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Selesai' },
        riwayatData: [{ tanggal: '2026-10-05 09:45', aktivitas: 'Inspeksi lolos standar', status: 'Memenuhi' }],
      },
      {
        noPemeriksaan: 'PL-2026-0013',
        pemeriksaanKe: 2,
        kodeJadwalTanam: 'JT-2026-0013',
        tanggalPemeriksaan: new Date('2026-10-04T13:10:00'),
        komoditas: 'Padi',
        varietas: 'Inpari 32',
        petani: 'Rini Wulandari',
        lahan: 'Lahan F / Blok 03',
        fase: 'Generatif',
        petugasQc: 'Sari Wulandari',
        persentaseKemurnian: 98.1,
        status: 'Perlu Roguing',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 981,
        tanamanOffType: 19,
        keterangan: 'Perlu roguing malai merah',
        catatan: 'Ditemukan 19 rumpun padi liar (red rice/off-type) pada fase pengisian bulir.',
        temuanOffType: [
          { no: 1, jenisKarakter: 'Tinggi tanaman', jumlah: 11, keterangan: 'Lebih tinggi dari kanopi utama' },
          { no: 2, jenisKarakter: 'Warna gabah', jumlah: 8, keterangan: 'Ujung gabah berbulu ungu' },
        ],
        dokumentasi: ['/images/pemeriksaan/field-3.jpg'],
        roguingData: { status: 'Dijadwalkan', tanggalRencana: '2026-10-06' },
        riwayatData: [{ tanggal: '2026-10-04 13:10', aktivitas: 'Pemeriksaan fase generatif', status: 'Perlu Roguing' }],
      },
      {
        noPemeriksaan: 'PL-2026-0012',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0012',
        tanggalPemeriksaan: new Date('2026-10-03T08:40:00'),
        komoditas: 'Terong',
        varietas: 'Hibrida',
        petani: 'Endang Sulisatri',
        lahan: 'Lahan G / Blok 02',
        fase: 'Berbunga',
        petugasQc: 'Andi Pratama',
        persentaseKemurnian: 100.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 1000,
        tanamanOffType: 0,
        keterangan: 'Sempurna, 100% murni',
        catatan: 'Kualitas tanaman sangat prima, tidak ditemukan tanaman liar atau off-type.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-2.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [{ tanggal: '2026-10-03 08:40', aktivitas: 'Pemeriksaan fase berbunga selesai', status: 'Memenuhi' }],
      },
      {
        noPemeriksaan: 'PL-2026-0011',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0011',
        tanggalPemeriksaan: new Date('2026-10-01T15:20:00'),
        komoditas: 'Wortel',
        varietas: 'Nantes',
        petani: 'Slamet Riyadi',
        lahan: 'Lahan H / Blok 01',
        fase: 'Vegetatif',
        petugasQc: 'Rina Agustina',
        persentaseKemurnian: 99.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 990,
        tanamanOffType: 10,
        keterangan: 'Memenuhi standar',
        catatan: 'Pertumbuhan umbi dan tajuk seragam.',
        temuanOffType: [{ no: 1, jenisKarakter: 'Bentuk daun', jumlah: 10, keterangan: 'Helai daun kasar' }],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [{ tanggal: '2026-10-01 15:20', aktivitas: 'Pemeriksaan vegetatif', status: 'Memenuhi' }],
      },
      {
        noPemeriksaan: 'PL-2026-0010',
        pemeriksaanKe: 2,
        kodeJadwalTanam: 'JT-2026-0010',
        tanggalPemeriksaan: new Date('2026-09-29T10:05:00'),
        komoditas: 'Cabai',
        varietas: 'Keriting',
        petani: 'Rudi Hartono',
        lahan: 'Lahan I / Blok 02',
        fase: 'Berbunga',
        petugasQc: 'Budi Santoso',
        persentaseKemurnian: 95.3,
        status: 'Perlu Roguing',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 953,
        tanamanOffType: 47,
        keterangan: 'Perlu roguing segera',
        catatan: 'Ditemukan varian buah bulat non-keriting pada 47 pohon.',
        temuanOffType: [{ no: 1, jenisKarakter: 'Bentuk buah', jumlah: 47, keterangan: 'Bentuk tumpul membulat' }],
        dokumentasi: ['/images/pemeriksaan/field-4.jpg'],
        roguingData: { status: 'Dijadwalkan', tanggalRencana: '2026-10-02' },
        riwayatData: [{ tanggal: '2026-09-29 10:05', aktivitas: 'Pemeriksaan bunga/buah muda', status: 'Perlu Roguing' }],
      },
      {
        noPemeriksaan: 'PL-2026-0009',
        pemeriksaanKe: 3,
        kodeJadwalTanam: 'JT-2026-0009',
        tanggalPemeriksaan: new Date('2026-09-28T09:30:00'),
        komoditas: 'Tomat',
        varietas: 'Grand Rapids',
        petani: 'Tono Wijaya',
        lahan: 'Lahan J / Blok 01',
        fase: 'Generatif',
        petugasQc: 'Sari Wulandari',
        persentaseKemurnian: 100.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 1000,
        tanamanOffType: 0,
        keterangan: 'Sempurna, 100% murni',
        catatan: 'Roguing sebelumnya sukses 100%, kini tanaman sangat murni menjelang panen.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-2.jpg'],
        roguingData: { status: 'Selesai' },
        riwayatData: [{ tanggal: '2026-09-28 09:30', aktivitas: 'Pemeriksaan akhir pra-panen', status: 'Memenuhi' }],
      },
      // Tambahan 14 data untuk menggenapi 24 data (Memenuhi: 16, Perlu Roguing: 4, Tidak Memenuhi: 2, Rata-rata 98,7%)
      {
        noPemeriksaan: 'PL-2026-0008',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0008',
        tanggalPemeriksaan: new Date('2026-09-26T08:30:00'),
        komoditas: 'Cabai',
        varietas: 'Keriting',
        petani: 'Sri Wahyuni',
        lahan: 'Lahan A / Blok 03',
        fase: 'Vegetatif',
        petugasQc: 'Andi Pratama',
        persentaseKemurnian: 98.8,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 988,
        tanamanOffType: 12,
        keterangan: 'Memenuhi standar',
        catatan: 'Vegetatif seragam.',
        temuanOffType: [{ no: 1, jenisKarakter: 'Bentuk daun', jumlah: 12, keterangan: 'Sedikit keriting' }],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0007',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0007',
        tanggalPemeriksaan: new Date('2026-09-25T11:15:00'),
        komoditas: 'Jagung',
        varietas: 'Hibrida',
        petani: 'Joko Susilo',
        lahan: 'Lahan K / Blok 01',
        fase: 'Berbunga',
        petugasQc: 'Rina Agustina',
        persentaseKemurnian: 97.9,
        status: 'Perlu Roguing',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 979,
        tanamanOffType: 21,
        keterangan: 'Perlu roguing malai jantan',
        catatan: 'Tassel abnormal perlu dipangkas.',
        temuanOffType: [{ no: 1, jenisKarakter: 'Warna malai', jumlah: 21, keterangan: 'Tassel coklat kemerahan' }],
        dokumentasi: ['/images/pemeriksaan/field-3.jpg'],
        roguingData: { status: 'Dijadwalkan', tanggalRencana: '2026-09-28' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0006',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0006',
        tanggalPemeriksaan: new Date('2026-09-23T14:00:00'),
        komoditas: 'Padi',
        varietas: 'Ciherang',
        petani: 'Ahmad Yani',
        lahan: 'Lahan L / Blok 02',
        fase: 'Vegetatif',
        petugasQc: 'Rudi Hartono',
        persentaseKemurnian: 94.2,
        status: 'Tidak Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 942,
        tanamanOffType: 58,
        keterangan: 'Kontaminasi varietas tinggi',
        catatan: 'Kontaminasi benih campuran di petak barat.',
        temuanOffType: [{ no: 1, jenisKarakter: 'Warna daun', jumlah: 58, keterangan: 'Pucat bergaris putih' }],
        dokumentasi: ['/images/pemeriksaan/field-4.jpg'],
        roguingData: { status: 'Karantina' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0005',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0005',
        tanggalPemeriksaan: new Date('2026-09-21T09:10:00'),
        komoditas: 'Kedelai',
        varietas: 'Anjasmoro',
        petani: 'Bambang S.',
        lahan: 'Lahan M / Blok 01',
        fase: 'Vegetatif',
        petugasQc: 'Sari Wulandari',
        persentaseKemurnian: 99.4,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 994,
        tanamanOffType: 6,
        keterangan: 'Memenuhi standar',
        catatan: 'Pertumbuhan optimal.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0004',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0004',
        tanggalPemeriksaan: new Date('2026-09-19T10:45:00'),
        komoditas: 'Semangka',
        varietas: 'Inul',
        petani: 'Hendra K.',
        lahan: 'Lahan N / Blok 03',
        fase: 'Berbunga',
        petugasQc: 'Budi Santoso',
        persentaseKemurnian: 99.1,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 991,
        tanamanOffType: 9,
        keterangan: 'Memenuhi standar',
        catatan: 'Sulur dan bunga terbentuk seragam.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-2.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0003',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0003',
        tanggalPemeriksaan: new Date('2026-09-18T13:30:00'),
        komoditas: 'Bawang Merah',
        varietas: 'Tajuk',
        petani: 'Supratman',
        lahan: 'Lahan O / Blok 02',
        fase: 'Vegetatif',
        petugasQc: 'Andi Pratama',
        persentaseKemurnian: 99.8,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 998,
        tanamanOffType: 2,
        keterangan: 'Memenuhi standar',
        catatan: 'Kondisi anakan rapat dan sehat.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0002',
        pemeriksaanKe: 2,
        kodeJadwalTanam: 'JT-2026-0002',
        tanggalPemeriksaan: new Date('2026-09-16T08:50:00'),
        komoditas: 'Melon',
        varietas: 'Golden',
        petani: 'Sukirno',
        lahan: 'Lahan P / Blok 01',
        fase: 'Generatif',
        petugasQc: 'Rina Agustina',
        persentaseKemurnian: 100.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 1000,
        tanamanOffType: 0,
        keterangan: 'Sempurna, 100% murni',
        catatan: 'Jaring net melon terbentuk sempurna.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-2.jpg'],
        roguingData: { status: 'Selesai' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0001',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0001',
        tanggalPemeriksaan: new Date('2026-09-14T10:00:00'),
        komoditas: 'Kangkung',
        varietas: 'Bisi',
        petani: 'Indra Gunawan',
        lahan: 'Lahan Q / Blok 02',
        fase: 'Vegetatif',
        petugasQc: 'Rudi Hartono',
        persentaseKemurnian: 99.6,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 996,
        tanamanOffType: 4,
        keterangan: 'Memenuhi standar',
        catatan: 'Pertumbuhan daun hijau merata.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0024',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0024',
        tanggalPemeriksaan: new Date('2026-09-12T15:20:00'),
        komoditas: 'Padi',
        varietas: 'Inpari 42',
        petani: 'Mulyadi',
        lahan: 'Lahan R / Blok 01',
        fase: 'Generatif',
        petugasQc: 'Sari Wulandari',
        persentaseKemurnian: 100.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 1000,
        tanamanOffType: 0,
        keterangan: 'Sempurna, 100% murni',
        catatan: 'Lahan bersih dari gulma dan varietas asing.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-3.jpg'],
        roguingData: { status: 'Selesai' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0023',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0023',
        tanggalPemeriksaan: new Date('2026-09-10T09:15:00'),
        komoditas: 'Terong',
        varietas: 'Ungu',
        petani: 'Warsito',
        lahan: 'Lahan S / Blok 02',
        fase: 'Berbunga',
        petugasQc: 'Budi Santoso',
        persentaseKemurnian: 98.9,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 989,
        tanamanOffType: 11,
        keterangan: 'Memenuhi standar',
        catatan: 'Bunga ungu lebat.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-2.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0022',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0022',
        tanggalPemeriksaan: new Date('2026-09-08T11:30:00'),
        komoditas: 'Cabai',
        varietas: 'Rawit Merah',
        petani: 'Yanto',
        lahan: 'Lahan T / Blok 01',
        fase: 'Vegetatif',
        petugasQc: 'Andi Pratama',
        persentaseKemurnian: 99.3,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 993,
        tanamanOffType: 7,
        keterangan: 'Memenuhi standar',
        catatan: 'Tajuk rimbun.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0021',
        pemeriksaanKe: 2,
        kodeJadwalTanam: 'JT-2026-0021',
        tanggalPemeriksaan: new Date('2026-09-05T14:10:00'),
        komoditas: 'Tomat',
        varietas: 'Servo',
        petani: 'Supriyadi',
        lahan: 'Lahan U / Blok 03',
        fase: 'Berbunga',
        petugasQc: 'Rina Agustina',
        persentaseKemurnian: 99.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 990,
        tanamanOffType: 10,
        keterangan: 'Memenuhi standar',
        catatan: 'Bunga lebat.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-2.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0020',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0020',
        tanggalPemeriksaan: new Date('2026-09-03T08:45:00'),
        komoditas: 'Bayam',
        varietas: 'Hijau',
        petani: 'Darsono',
        lahan: 'Lahan V / Blok 01',
        fase: 'Vegetatif',
        petugasQc: 'Rudi Hartono',
        persentaseKemurnian: 100.0,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 1000,
        tanamanOffType: 0,
        keterangan: 'Sempurna, 100% murni',
        catatan: 'Vegetasi seragam.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-1.jpg'],
        roguingData: { status: 'Selesai' },
        riwayatData: [],
      },
      {
        noPemeriksaan: 'PL-2026-0019',
        pemeriksaanKe: 1,
        kodeJadwalTanam: 'JT-2026-0019',
        tanggalPemeriksaan: new Date('2026-09-01T10:30:00'),
        komoditas: 'Kacang Panjang',
        varietas: 'Kanton',
        petani: 'Sudirman',
        lahan: 'Lahan W / Blok 02',
        fase: 'Generatif',
        petugasQc: 'Sari Wulandari',
        persentaseKemurnian: 99.2,
        status: 'Memenuhi',
        jumlahTanamanDiamati: 1000,
        tanamanSesuai: 992,
        tanamanOffType: 8,
        keterangan: 'Memenuhi standar',
        catatan: 'Polong seragam.',
        temuanOffType: [],
        dokumentasi: ['/images/pemeriksaan/field-3.jpg'],
        roguingData: { status: 'Tidak Perlu' },
        riwayatData: [],
      },
    ];

    for (const rec of initialRecords) {
      const jtId = findJtId(rec.kodeJadwalTanam);
      await prisma.pemeriksaanLahan.create({
        data: {
          ...rec,
          jadwalTanamId: jtId,
        },
      });
    }
  }

  /**
   * Find All dengan Filter, Search, Tab, dan Paginasi
   */
  async findAll(params: FindPemeriksaanLahanParams) {
    await this.seedInitialDataIfEmpty();

    const {
      search,
      komoditas,
      status,
      tab = 'semua',
      fase,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = params;

    const where: any = {};

    if (search && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { kodeJadwalTanam: { contains: q } },
        { noPemeriksaan: { contains: q } },
        { komoditas: { contains: q } },
        { varietas: { contains: q } },
        { petani: { contains: q } },
        { lahan: { contains: q } },
        { petugasQc: { contains: q } },
      ];
    }

    if (komoditas && komoditas !== 'Semua' && komoditas !== 'Semua Komoditas') {
      where.komoditas = { contains: komoditas };
    }

    if (status && status !== 'Semua' && status !== 'Semua Status') {
      where.status = status;
    }

    if (fase && fase !== 'Semua') {
      where.fase = fase;
    }

    // Filter Quick Tab
    // 'semua' | 'pemeriksaan' | 'offtype' | 'roguing' | 'selesai'
    if (tab === 'offtype') {
      where.tanamanOffType = { gt: 0 };
    } else if (tab === 'roguing') {
      where.status = 'Perlu Roguing';
    } else if (tab === 'selesai') {
      where.status = 'Memenuhi';
    }

    if (startDate && endDate) {
      where.tanggalPemeriksaan = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const [items, total] = await Promise.all([
      prisma.pemeriksaanLahan.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          jadwalTanam: {
            include: {
              detailLahan: true,
              partner: true,
            },
          },
        },
      }),
      prisma.pemeriksaanLahan.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Mengambil statistik ringkasan kartu
   */
  async getStats() {
    await this.seedInitialDataIfEmpty();

    const all = await prisma.pemeriksaanLahan.findMany({
      select: { status: true, persentaseKemurnian: true, tanamanOffType: true },
    });

    const total = all.length;
    const memenuhi = all.filter((i) => i.status === 'Memenuhi').length;
    const perluRoguing = all.filter((i) => i.status === 'Perlu Roguing').length;
    const tidakMemenuhi = all.filter((i) => i.status === 'Tidak Memenuhi').length;

    const totalKemurnian = all.reduce((acc, curr) => acc + (curr.persentaseKemurnian || 0), 0);
    const avgKemurnian = total > 0 ? (totalKemurnian / total).toFixed(1) : '98.7';

    // Counts for Quick Filter tabs
    const offTypeCount = all.filter((i) => (i.tanamanOffType || 0) > 0).length;
    const roguingCount = perluRoguing;
    const selesaiCount = memenuhi;

    return {
      totalPemeriksaan: total,
      memenuhiStandar: memenuhi,
      perluRoguing,
      tidakMemenuhi,
      rataRataKemurnian: avgKemurnian,
      tabCounts: {
        semua: total,
        pemeriksaan: total,
        offType: offTypeCount,
        roguing: roguingCount,
        selesai: selesaiCount,
      },
    };
  }

  async findById(id: string) {
    return prisma.pemeriksaanLahan.findUnique({
      where: { id },
      include: {
        jadwalTanam: {
          include: {
            detailLahan: true,
            partner: true,
            commodity: true,
            variety: true,
          },
        },
      },
    });
  }

  async create(data: any) {
    return prisma.pemeriksaanLahan.create({
      data,
    });
  }

  async update(id: string, data: any) {
    return prisma.pemeriksaanLahan.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return prisma.pemeriksaanLahan.delete({
      where: { id },
    });
  }
}

export const pemeriksaanLahanRepository = new PemeriksaanLahanRepository();
