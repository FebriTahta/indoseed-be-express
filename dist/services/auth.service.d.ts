export declare const authService: {
    register: (data: any) => Promise<{
        id: string;
        username: string;
        email: string;
        password: string;
        isEmailVerified: boolean;
        defaultRoleId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verifyOtp: (userId: string, otp: string) => Promise<boolean>;
    resendOtp: (userId: string) => Promise<boolean>;
    login: (data: any) => Promise<{
        token: string;
        user: {
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
        };
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map