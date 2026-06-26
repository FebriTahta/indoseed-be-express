"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const user_repository_1 = require("../repositories/user.repository");
const getUsers = async (req, res) => {
    try {
        const users = await user_repository_1.userRepository.findAllUsersWithRoles();
        const formattedUsers = users.map(user => {
            const { roles, defaultRole, ...rest } = user;
            return {
                ...rest,
                activeRole: defaultRole,
                roles: roles.map(r => r.role)
            };
        });
        res.status(200).json({
            success: true,
            data: formattedUsers
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
exports.getUsers = getUsers;
//# sourceMappingURL=user.controller.js.map