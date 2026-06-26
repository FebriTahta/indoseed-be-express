export interface CommodityFilter {
    search?: string;
    kategori?: string;
    status?: string;
    page?: number;
    pageSize?: number;
}
export declare const commodityRepository: {
    create: (data: any) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tglDibuat: Date;
        dibuatOleh: string | null;
        image: string | null;
        kodeKomoditas: string;
        namaKomoditas: string;
        kategori: string;
        deskripsi: string | null;
        tglDiubah: Date;
        diubahOleh: string | null;
    }>;
    findById: (id: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tglDibuat: Date;
        dibuatOleh: string | null;
        image: string | null;
        kodeKomoditas: string;
        namaKomoditas: string;
        kategori: string;
        deskripsi: string | null;
        tglDiubah: Date;
        diubahOleh: string | null;
    } | null>;
    findByKodeKomoditas: (kodeKomoditas: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tglDibuat: Date;
        dibuatOleh: string | null;
        image: string | null;
        kodeKomoditas: string;
        namaKomoditas: string;
        kategori: string;
        deskripsi: string | null;
        tglDiubah: Date;
        diubahOleh: string | null;
    } | null>;
    update: (id: string, data: any) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tglDibuat: Date;
        dibuatOleh: string | null;
        image: string | null;
        kodeKomoditas: string;
        namaKomoditas: string;
        kategori: string;
        deskripsi: string | null;
        tglDiubah: Date;
        diubahOleh: string | null;
    }>;
    delete: (id: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        tglDibuat: Date;
        dibuatOleh: string | null;
        image: string | null;
        kodeKomoditas: string;
        namaKomoditas: string;
        kategori: string;
        deskripsi: string | null;
        tglDiubah: Date;
        diubahOleh: string | null;
    }>;
    findAll: (filters: CommodityFilter) => Promise<{
        items: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: string;
            tglDibuat: Date;
            dibuatOleh: string | null;
            image: string | null;
            kodeKomoditas: string;
            namaKomoditas: string;
            kategori: string;
            deskripsi: string | null;
            tglDiubah: Date;
            diubahOleh: string | null;
        }[];
        pagination: {
            currentPage: number;
            pageSize: number;
            totalItems: number;
            totalPages: number;
        };
    }>;
};
//# sourceMappingURL=commodity.repository.d.ts.map