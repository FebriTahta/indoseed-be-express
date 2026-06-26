"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadSingle = void 0;
const multer_1 = __importDefault(require("multer"));
// Use memory storage to avoid saving files locally
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'), false);
        }
    },
});
const uploadSingle = (fieldName) => {
    const multerUpload = upload.single(fieldName);
    return (req, res, next) => {
        multerUpload(req, res, (err) => {
            if (err) {
                return res.status(400).json({
                    status: 'error',
                    message: err.message || 'File upload error',
                });
            }
            next();
        });
    };
};
exports.uploadSingle = uploadSingle;
//# sourceMappingURL=upload.middleware.js.map