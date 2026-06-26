"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRepository = void 0;
const prisma_1 = require("../utils/prisma");
exports.roleRepository = {
    findByName: async (name) => {
        return prisma_1.prisma.role.findFirst({ where: { name } });
    },
    create: async (name) => {
        return prisma_1.prisma.role.create({ data: { name } });
    },
};
//# sourceMappingURL=role.repository.js.map