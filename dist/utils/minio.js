"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.uploadFile = exports.initMinio = exports.bucketName = exports.minioClient = void 0;
const Minio = __importStar(require("minio"));
const path_1 = __importDefault(require("path"));
const minioUrl = process.env.MINIO_PATH || 'http://localhost:9000';
let parsedUrl;
try {
    parsedUrl = new URL(minioUrl);
}
catch (e) {
    console.error(`Invalid MINIO_PATH: ${minioUrl}. Falling back to default URL.`);
    parsedUrl = new URL('http://localhost:9000');
}
exports.minioClient = new Minio.Client({
    endPoint: parsedUrl.hostname,
    port: parsedUrl.port ? parseInt(parsedUrl.port) : (parsedUrl.protocol === 'https:' ? 443 : 80),
    useSSL: parsedUrl.protocol === 'https:',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
});
exports.bucketName = process.env.MINIO_BUCKET || 'dev';
// Initialize bucket and set policy to public-read for public file access
const initMinio = async () => {
    try {
        const exists = await exports.minioClient.bucketExists(exports.bucketName);
        if (!exists) {
            await exports.minioClient.makeBucket(exports.bucketName, 'us-east-1');
            console.log(`Bucket '${exports.bucketName}' created successfully.`);
            // Set public read policy for the bucket
            const policy = {
                Version: '2012-10-17',
                Statement: [
                    {
                        Sid: 'PublicRead',
                        Effect: 'Allow',
                        Principal: '*',
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${exports.bucketName}/*`],
                    },
                ],
            };
            await exports.minioClient.setBucketPolicy(exports.bucketName, JSON.stringify(policy));
            console.log(`Public read policy set for bucket '${exports.bucketName}'.`);
        }
        else {
            console.log(`Bucket '${exports.bucketName}' already exists.`);
        }
    }
    catch (error) {
        console.error('Error initializing Minio bucket:', error);
    }
};
exports.initMinio = initMinio;
/**
 * Uploads a file buffer to Minio and returns the public URL.
 */
const uploadFile = async (fileBuffer, originalFilename, mimeType) => {
    const extension = path_1.default.extname(originalFilename);
    const uniqueFilename = `greenhouses/${Date.now()}-${Math.random().toString(36).substring(2, 15)}${extension}`;
    await exports.minioClient.putObject(exports.bucketName, uniqueFilename, fileBuffer, fileBuffer.length, {
        'Content-Type': mimeType,
    });
    // Return the public URL of the uploaded image
    return `${minioUrl}/${exports.bucketName}/${uniqueFilename}`;
};
exports.uploadFile = uploadFile;
/**
 * Deletes a file from Minio by its public URL or object name.
 */
const deleteFile = async (fileUrl) => {
    try {
        if (!fileUrl)
            return;
        // Extract object name from public URL
        // e.g. http://145.79.12.74:9000/dev/greenhouses/123-abc.jpg -> greenhouses/123-abc.jpg
        const searchString = `/${exports.bucketName}/`;
        const index = fileUrl.indexOf(searchString);
        if (index === -1)
            return;
        const objectName = fileUrl.substring(index + searchString.length);
        await exports.minioClient.removeObject(exports.bucketName, objectName);
        console.log(`Deleted object '${objectName}' from bucket '${exports.bucketName}'.`);
    }
    catch (error) {
        console.error(`Failed to delete object from Minio:`, error);
    }
};
exports.deleteFile = deleteFile;
//# sourceMappingURL=minio.js.map