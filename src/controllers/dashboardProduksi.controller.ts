import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const getDashboardProduksiData = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const isFiltered = Boolean(startDate || endDate);

    // Setup start and end Date objects
    let start: Date;
    let end: Date;

    if (startDate) {
      start = new Date(`${startDate}T00:00:00.000Z`);
    } else {
      start = new Date('2024-01-01T00:00:00.000Z');
    }

    if (endDate) {
      end = new Date(`${endDate}T23:59:59.999Z`);
    } else {
      end = new Date('2030-12-31T23:59:59.999Z');
    }

    const startDateStr = (startDate as string) || '2026-06-01';
    const endDateStr = (endDate as string) || '2026-06-30';

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const dayDiff = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    // Date parser helper for String format 'DD/MM/YYYY', 'DD/MM/YYYY HH:mm', ISO date or Date object
    const parseAnyDate = (dateVal: any): Date | null => {
      if (!dateVal) return null;
      if (dateVal instanceof Date) return isNaN(dateVal.getTime()) ? null : dateVal;
      const str = String(dateVal).trim();
      if (!str) return null;

      if (str.includes('/')) {
        const datePart = str.split(' ')[0];
        if (datePart) {
          const parts = datePart.split('/');
          if (parts.length === 3 && parts[0] && parts[1] && parts[2]) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const d = new Date(year, month, day, 12, 0, 0);
            return isNaN(d.getTime()) ? null : d;
          }
        }
      }

      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    };

    const formatDateStr = (d: Date | null | undefined): string => {
      if (!d || isNaN(d.getTime())) return '-';
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const isDateInRange = (dateVal: any): boolean => {
      if (!isFiltered) return true;
      const d = parseAnyDate(dateVal);
      if (!d) return false;
      return d >= start && d <= end;
    };

    // Query production tables from database
    const [allBatchProduksi, allTreatment, allPengeringan, allSortasi, allJadwalTanam] = await Promise.all([
      prisma.batchProduksi.findMany().catch(() => []),
      prisma.treatment.findMany().catch(() => []),
      prisma.pengeringan.findMany().catch(() => []),
      prisma.sortasi.findMany().catch(() => []),
      prisma.jadwalTanam.findMany().catch(() => []),
    ]);

    // Helper to check if a batch belongs to date range based on operational dates
    const isBatchInDateRange = (item: any): boolean => {
      if (!isFiltered) return true;
      return (
        isDateInRange(item.tanggalSelesai) ||
        isDateInRange(item.tanggalMulai) ||
        isDateInRange(item.createdAt)
      );
    };

    const filteredBatches: any[] = allBatchProduksi.filter(isBatchInDateRange);

    const listSelesai = filteredBatches.filter((b: any) => b.status === 'Selesai').map((b: any, idx: number) => ({
      no: idx + 1,
      kodeBatch: b.kodeBatch,
      produk: `${b.komoditas} ${b.varietas}`,
      tahapSaatIni: 'Selesai',
      statusGroup: 'Selesai',
      targetKg: b.targetKg || 0,
      realisasiKg: b.hasilKg || 0,
      lokasi: b.lokasi || 'Gudang Processing A',
      catatan: b.catatan || 'Pengolahan Selesai',
      tanggal: b.tanggalSelesai || b.tanggalMulai,
    }));

    const listProses = filteredBatches.filter((b: any) => b.status === 'Proses' || b.status === 'Pending').map((b: any, idx: number) => ({
      no: idx + 1,
      kodeBatch: b.kodeBatch,
      produk: `${b.komoditas} ${b.varietas}`,
      tahapSaatIni: b.status === 'Pending' ? 'Pending Queue' : 'Pemeliharaan / Processing',
      statusGroup: 'Proses',
      targetKg: b.targetKg || 0,
      realisasiKg: b.hasilKg || 0,
      lokasi: b.lokasi || 'Ruang Processing',
      catatan: b.catatan || 'Sedang Dalam Proses',
      tanggal: b.tanggalMulai,
    }));

    const filteredPengeringan = allPengeringan.filter((p: any) => isDateInRange(p.selesai) || isDateInRange(p.createdAt));
    const listPengeringan = filteredPengeringan.map((p: any, idx: number) => ({
      no: idx + 1,
      kodeBatch: p.kodeBatch,
      produk: `${p.komoditas} ${p.varietas}`,
      tahapSaatIni: 'Pengeringan',
      statusGroup: 'Pengeringan',
      targetKg: p.beratMasuk || 0,
      realisasiKg: p.beratKeluar || Math.round((p.beratMasuk || 0) * 0.88),
      lokasi: p.lokasi || p.alatPengering || 'Gudang Pengeringan',
      catatan: p.catatan || `Kadar air saat ini: ${p.kadarAirSaatIni}% (Target: ${p.kadarAirTarget}%)`,
      tanggal: p.selesai || 'Proses Pengeringan',
    }));

    const filteredSortasi = allSortasi.filter((s: any) => isDateInRange(s.tanggalSortasi) || isDateInRange(s.createdAt));
    const listSortasi = filteredSortasi.map((s: any, idx: number) => ({
      no: idx + 1,
      kodeBatch: s.kodeBatch,
      produk: `${s.komoditas} ${s.varietas}`,
      tahapSaatIni: 'Sortasi / QC',
      statusGroup: 'Sortasi / QC',
      targetKg: s.beratMasuk || 0,
      realisasiKg: s.hasilLulus || 0,
      lokasi: s.lokasi || s.alatSortasi || 'Gudang Sortasi',
      catatan: s.catatan || `Recovery: ${s.recovery}% (Operator: ${s.operator || 'Admin'})`,
      tanggal: s.tanggalSortasi,
    }));

    const filteredTidakAktif = allJadwalTanam.filter(
      (j: any) => (isDateInRange(j.tanggalTanam) || isDateInRange(j.createdAt)) && j.statusJadwal !== 'Approved'
    );
    const listTidakAktif = filteredTidakAktif.map((j: any, idx: number) => ({
      no: idx + 1,
      kodeBatch: j.kodeJadwalTanam,
      produk: `${j.tujuanProduksi || 'Jadwal Tanam'} (${j.penanggungJawab || 'Admin'})`,
      tahapSaatIni: `Tidak Aktif (${j.statusJadwal || 'Draft'})`,
      statusGroup: 'Tidak Aktif',
      targetKg: j.targetProduksi || 0,
      realisasiKg: 0,
      lokasi: j.penanggungJawab || 'PJ Belum Ditentukan',
      catatan: j.catatan || `Status Jadwal: ${j.statusJadwal}`,
      tanggal: j.tanggalTanam ? formatDateStr(new Date(j.tanggalTanam)) : 'Belum Mulai',
    }));

    let finishedBatchCount = listSelesai.length;
    let activeBatchCount = listProses.length;
    let pengeringanCount = listPengeringan.length;
    let sortasiCount = listSortasi.length;
    let tidakAktifCount = listTidakAktif.length;

    const hasDbData = (finishedBatchCount + activeBatchCount + pengeringanCount + sortasiCount + tidakAktifCount) > 0;

    // Only fallback to demo values if NOT filtered and database has 0 records overall
    if (!isFiltered && !hasDbData) {
      finishedBatchCount = 12;
      activeBatchCount = 8;
      pengeringanCount = 2;
      sortasiCount = 1;
      tidakAktifCount = 1;
    }

    const totalStatusCount = finishedBatchCount + activeBatchCount + pengeringanCount + sortasiCount + tidakAktifCount;
    const totalBatchCount = finishedBatchCount + activeBatchCount + pengeringanCount + sortasiCount;

    const calcPct = (cnt: number, tot: number) => {
      if (!tot || tot === 0) return '0.0%';
      return `${((cnt / tot) * 100).toFixed(1)}%`;
    };

    // Calculate total production volume in Kg for filtered batches
    const totalHasilKg = filteredBatches.reduce((acc: number, item: any) => acc + (item.hasilKg || 0), 0);
    const prodTodayVal = totalHasilKg > 0 ? totalHasilKg : (isFiltered && totalStatusCount === 0 ? 0 : 1250);
    const targetMonthVal = 25000;
    const targetProgress = Math.min(100, Math.round((prodTodayVal * 100) / targetMonthVal));

    // Format active batch list from DB records if available
    const activeBatchListFormatted = filteredBatches.slice(0, 10).map((b: any, idx: number) => ({
      no: idx + 1,
      kodeBatch: b.kodeBatch,
      produk: `${b.komoditas} ${b.varietas}`,
      tanggalTanam: b.tanggalMulai,
      tahapSaatIni: b.status === 'Selesai' ? 'Selesai' : 'Pemeliharaan / Processing',
      progress: b.yieldPercent ? Math.min(100, Math.round(b.yieldPercent)) : (b.status === 'Selesai' ? 100 : 60),
      progressColor: 'bg-emerald-500',
      targetKg: b.targetKg || 0,
      realisasiKg: b.hasilKg || 0,
    }));

    const dashboardData = {
      summaryCards: [
        {
          id: 'total_batch',
          title: 'TOTAL BATCH PRODUKSI',
          value: totalBatchCount,
          unit: 'Batch',
          percent: isFiltered && totalStatusCount === 0 ? '0.0%' : '+20.0%',
          trend: 'up',
          subtext: 'dari periode lalu',
          icon: 'ri-clipboard-line',
          color: 'emerald',
          bgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        },
        {
          id: 'batch_aktif',
          title: 'BATCH AKTIF',
          value: activeBatchCount,
          unit: 'Batch',
          percent: isFiltered && totalStatusCount === 0 ? '0.0%' : '+14.3%',
          trend: 'up',
          subtext: 'dari periode lalu',
          icon: 'ri-play-circle-line',
          color: 'blue',
          bgClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
          id: 'selesai_produksi',
          title: 'SELESAI PRODUKSI',
          value: finishedBatchCount,
          unit: 'Batch',
          percent: isFiltered && totalStatusCount === 0 ? '0.0%' : '+33.3%',
          trend: 'up',
          subtext: 'dari periode lalu',
          icon: 'ri-checkbox-circle-line',
          color: 'emerald',
          bgClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        },
        {
          id: 'produksi_hari_ini',
          title: 'PRODUKSI HARI INI',
          value: prodTodayVal.toLocaleString('id-ID'),
          unit: 'Kg',
          percent: isFiltered && totalStatusCount === 0 ? '0.0%' : '+15.6%',
          trend: 'up',
          subtext: 'dari kemarin',
          icon: 'ri-building-4-line',
          color: 'purple',
          bgClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        },
        {
          id: 'target_bulan_ini',
          title: 'TARGET BULAN INI',
          value: targetMonthVal.toLocaleString('id-ID'),
          unit: 'Kg',
          percent: `${targetProgress}%`,
          trend: 'progress',
          subtext: 'tercapai',
          icon: 'ri-focus-3-line',
          color: 'amber',
          progressValue: targetProgress,
          bgClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        },
      ],

      statusProduksi: {
        total: totalStatusCount,
        series: [finishedBatchCount, activeBatchCount, pengeringanCount, sortasiCount, tidakAktifCount],
        labels: ['Selesai', 'Proses', 'Pengeringan', 'Sortasi / QC', 'Tidak Aktif'],
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#9ca3af'],
        breakdown: [
          { label: 'Selesai', count: finishedBatchCount, percentage: calcPct(finishedBatchCount, totalStatusCount), color: '#10b981', items: listSelesai },
          { label: 'Proses', count: activeBatchCount, percentage: calcPct(activeBatchCount, totalStatusCount), color: '#3b82f6', items: listProses },
          { label: 'Pengeringan', count: pengeringanCount, percentage: calcPct(pengeringanCount, totalStatusCount), color: '#f59e0b', items: listPengeringan },
          { label: 'Sortasi / QC', count: sortasiCount, percentage: calcPct(sortasiCount, totalStatusCount), color: '#ef4444', items: listSortasi },
          { label: 'Tidak Aktif', count: tidakAktifCount, percentage: calcPct(tidakAktifCount, totalStatusCount), color: '#9ca3af', items: listTidakAktif },
        ],
        details: {
          selesai: listSelesai,
          proses: listProses,
          pengeringan: listPengeringan,
          sortasi: listSortasi,
          tidakAktif: listTidakAktif,
          semua: [...listSelesai, ...listProses, ...listPengeringan, ...listSortasi, ...listTidakAktif],
        },
      },

      produksiPerTahap: {
        categories: ['Perencanaan', 'Tanam', 'Pemeliharaan', 'Panen', 'Pengeringan', 'Sortasi', 'QC'],
        series: [
          {
            name: 'Jumlah Batch',
            data: totalBatchCount === 0 ? [0, 0, 0, 0, 0, 0, 0] : [
              totalBatchCount,
              Math.max(1, Math.round(totalBatchCount * 0.83)),
              Math.max(1, Math.round(totalBatchCount * 0.67)),
              Math.max(1, Math.round(totalBatchCount * 0.5)),
              Math.max(1, Math.round(totalBatchCount * 0.33)),
              Math.max(1, Math.round(totalBatchCount * 0.17)),
              Math.max(1, Math.round(totalBatchCount * 0.12)),
            ],
          },
        ],
      },

      produksiVsTarget: {
        categories: [
          formatDateStr(start),
          formatDateStr(new Date(start.getTime() + (end.getTime() - start.getTime()) * 0.25)),
          formatDateStr(new Date(start.getTime() + (end.getTime() - start.getTime()) * 0.5)),
          formatDateStr(new Date(start.getTime() + (end.getTime() - start.getTime()) * 0.75)),
          formatDateStr(end),
        ],
        series: [
          {
            name: 'Produksi (Kg)',
            data: totalBatchCount === 0 ? [0, 0, 0, 0, 0] : [
              Math.round(targetMonthVal * 0.1),
              Math.round(targetMonthVal * 0.3),
              Math.round(targetMonthVal * 0.55),
              Math.round(targetMonthVal * 0.75),
              Math.round(targetMonthVal * (targetProgress / 100)),
            ],
          },
          {
            name: 'Target (Kg)',
            data: totalBatchCount === 0 ? [0, 0, 0, 0, 0] : [
              Math.round(targetMonthVal * 0.2),
              Math.round(targetMonthVal * 0.4),
              Math.round(targetMonthVal * 0.6),
              Math.round(targetMonthVal * 0.8),
              targetMonthVal,
            ],
          },
        ],
      },

      batchProduksiAktif: activeBatchListFormatted,

      produksiPerProduk: {
        totalKg: Math.round(prodTodayVal * dayDiff),
        series: [
          Math.round(prodTodayVal * dayDiff * 0.35),
          Math.round(prodTodayVal * dayDiff * 0.22),
          Math.round(prodTodayVal * dayDiff * 0.16),
          Math.round(prodTodayVal * dayDiff * 0.12),
          Math.round(prodTodayVal * dayDiff * 0.15),
        ],
        labels: ['Padi IR64', 'Padi Ciherang', 'Tomat Servo', 'Cabai Lado F1', 'Lainnya'],
        colors: ['#059669', '#2563eb', '#f59e0b', '#dc2626', '#9ca3af'],
        breakdown: [
          { label: 'Padi IR64', kg: Math.round(prodTodayVal * dayDiff * 0.35), percentage: '35.0%', color: '#059669' },
          { label: 'Padi Ciherang', kg: Math.round(prodTodayVal * dayDiff * 0.22), percentage: '22.0%', color: '#2563eb' },
          { label: 'Tomat Servo', kg: Math.round(prodTodayVal * dayDiff * 0.16), percentage: '16.0%', color: '#f59e0b' },
          { label: 'Cabai Lado F1', kg: Math.round(prodTodayVal * dayDiff * 0.12), percentage: '12.0%', color: '#dc2626' },
          { label: 'Lainnya', kg: Math.round(prodTodayVal * dayDiff * 0.15), percentage: '15.0%', color: '#9ca3af' },
        ],
      },

      notifikasiProduksi: [
        {
          id: 1,
          type: 'panen',
          title: 'Jadwal panen Padi IR64',
          message: `Batch BCH-${startDateStr.replace(/-/g, '').slice(2, 6)}-001 akan panen pada ${formatDateStr(end)}`,
          time: '2 jam lalu',
          icon: 'ri-calendar-event-line',
          bgColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
        },
        {
          id: 2,
          type: 'pengeringan',
          title: 'Pengeringan selesai',
          message: `Batch BCH-${startDateStr.replace(/-/g, '').slice(2, 6)}-003 sudah selesai pengeringan`,
          time: '3 jam lalu',
          icon: 'ri-sun-line',
          bgColor: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
        },
        {
          id: 3,
          type: 'qc',
          title: 'QC diperlukan',
          message: `Batch BCH-${startDateStr.replace(/-/g, '').slice(2, 6)}-005 menunggu proses QC`,
          time: '5 jam lalu',
          icon: 'ri-error-warning-line',
          bgColor: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        },
        {
          id: 4,
          type: 'packing',
          title: 'Stok bahan packing menipis',
          message: 'Plastik 1 Kg tersisa 150 pcs',
          time: '1 hari lalu',
          icon: 'ri-box-3-line',
          bgColor: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
        },
      ],
    };

    return res.status(200).json({
      status: 'success',
      data: dashboardData,
    });
  } catch (error: any) {
    console.error('Error fetching Production Dashboard Data:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};

