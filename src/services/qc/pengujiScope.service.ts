import prisma from '../../utils/prisma';
import { getRequestContext } from '../../utils/requestContext';
import { forbidden } from '../../utils/httpError';
import { isRestrictedUser } from '../../constants/roles.constants';
import { PERMINTAAN_STATUS } from '../../constants/qc.constants';

/**
 * ID penguji milik user yang sedang login bila user tersebut ber-role terbatas (penguji),
 * atau `null` untuk role lain (tidak dibatasi). Penguji nonaktif / tanpa profil ditolak.
 */
export const getPengujiScope = async (): Promise<string | null> => {
  const user = getRequestContext()?.user;
  if (!user || !isRestrictedUser(user.roles)) return null;

  const penguji = await prisma.penguji.findUnique({ where: { userId: user.userId }, select: { id: true, status: true } });
  if (!penguji) throw forbidden('Akun Anda belum terhubung dengan data penguji.');
  if (penguji.status !== 'Aktif') throw forbidden('Status penguji Anda nonaktif.');
  return penguji.id;
};

/** Pastikan penguji hanya mengakses pengujian miliknya atau antrean sampling yang belum diambil. */
export const assertPengujiAccess = (pengujiId: string | null, item: { status: string; petugasQcId: string | null }) => {
  if (!pengujiId) return;
  if (item.petugasQcId === pengujiId) return;
  if (item.status === PERMINTAAN_STATUS.SAMPLING && !item.petugasQcId) return;
  throw forbidden('Pengujian ini ditugaskan kepada penguji lain.');
};

/** Penguji wajib (route sudah membatasi role; ini pengaman di lapisan service). */
export const requirePengujiScope = async () => {
  const pengujiId = await getPengujiScope();
  if (!pengujiId) throw forbidden('Pengujian hanya dapat dilakukan oleh penguji.');
  return pengujiId;
};

/** Penguji hanya boleh menerima sampel yang seluruh metode ujinya ia kuasai. */
export const assertMenguasaiMetode = async (
  pengujiId: string,
  parameters: { checked: boolean; metodeId: string | null; metodeNama?: string | null; nama: string }[]
) => {
  const dibutuhkan = new Map<string, string>();
  parameters.filter((p) => p.checked && p.metodeId).forEach((p) => dibutuhkan.set(p.metodeId!, p.metodeNama || p.nama));
  if (!dibutuhkan.size) return;

  const dikuasai = await prisma.pengujiTestMethod.findMany({
    where: { pengujiId, testMethodId: { in: [...dibutuhkan.keys()] } },
    select: { testMethodId: true },
  });
  const punya = new Set(dikuasai.map((d) => d.testMethodId));
  const kurang = [...dibutuhkan].filter(([id]) => !punya.has(id)).map(([, nama]) => nama);
  if (kurang.length) {
    throw forbidden(`Penguji belum terdaftar menguasai metode uji: ${kurang.join(', ')}. Hubungi admin untuk memperbarui kompetensi penguji.`);
  }
};
