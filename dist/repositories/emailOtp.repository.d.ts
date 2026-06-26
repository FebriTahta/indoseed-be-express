export declare const emailOtpRepository: {
    create: (data: any) => Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        otp: string;
        expiresAt: Date;
    }>;
    findValidOtp: (userId: string, otp: string) => Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        otp: string;
        expiresAt: Date;
    } | null>;
    findLatestOtpByUserId: (userId: string) => Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        otp: string;
        expiresAt: Date;
    } | null>;
    deleteByUserId: (userId: string) => Promise<import("@prisma/client").Prisma.BatchPayload>;
};
//# sourceMappingURL=emailOtp.repository.d.ts.map