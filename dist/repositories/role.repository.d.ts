export declare const roleRepository: {
    findByName: (name: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    } | null>;
    create: (name: string) => Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
};
//# sourceMappingURL=role.repository.d.ts.map