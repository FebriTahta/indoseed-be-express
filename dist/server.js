"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const minio_1 = require("./utils/minio");
const PORT = process.env.PORT || 8080;
(0, minio_1.initMinio)()
    .then(() => {
    app_1.default.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('Failed to initialize MinIO storage, server not started:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map