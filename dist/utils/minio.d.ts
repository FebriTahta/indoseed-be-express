import * as Minio from 'minio';
export declare const minioClient: Minio.Client;
export declare const bucketName: string;
export declare const initMinio: () => Promise<void>;
/**
 * Uploads a file buffer to Minio and returns the public URL.
 */
export declare const uploadFile: (fileBuffer: Buffer, originalFilename: string, mimeType: string) => Promise<string>;
/**
 * Deletes a file from Minio by its public URL or object name.
 */
export declare const deleteFile: (fileUrl: string) => Promise<void>;
//# sourceMappingURL=minio.d.ts.map