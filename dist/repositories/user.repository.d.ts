export declare const userRepository: {
    findByEmailOrUsername: (email: string, username: string) => Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        defaultRoleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findByUsername: (username: string) => Promise<({
        roles: ({
            role: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
        id: string;
        username: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        defaultRoleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findById: (id: string) => Promise<({
        roles: ({
            role: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            roleId: string;
        })[];
    } & {
        id: string;
        username: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        defaultRoleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create: (data: any) => Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        defaultRoleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateEmailVerification: (id: string, isEmailVerified: boolean) => Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        defaultRoleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllUsersWithRoles: () => Promise<{
        id: string;
        username: string;
        email: string;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        roles: {
            role: {
                id: string;
                name: string;
            };
        }[];
        defaultRole: {
            id: string;
            name: string;
        } | null;
    }[]>;
};
//# sourceMappingURL=user.repository.d.ts.map