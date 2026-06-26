"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
const client_1 = require("@prisma/client");
const adapter = new adapter_mariadb_1.PrismaMariaDb(process.env.DATABASE_URL);
exports.prisma = new client_1.PrismaClient({
    adapter,
});
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map