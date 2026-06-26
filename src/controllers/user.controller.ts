import { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userRepository.findAllUsersWithRoles();

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
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
