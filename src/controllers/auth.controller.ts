import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email and password are required' });
  }

  try {
    const newUser = await authService.register({ username, email, password });
    
    res.status(201).json({
      message: 'User registered successfully. Please check your email for OTP.',
      userId: newUser.id,
    });
  } catch (error: any) {
    if (error.message === 'User with this email or username already exists') {
      return res.status(400).json({ error: error.message });
    }
    if (error.sisaWaktu !== undefined) {
      return res.status(400).json({ error: error.message, sisaWaktu: error.sisaWaktu });
    }
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ error: 'userId and otp are required' });
  }

  try {
    await authService.verifyOtp(userId, otp);
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error: any) {
    if (error.message === 'Invalid or expired OTP') {
      return res.status(400).json({ error: error.message });
    }
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    await authService.resendOtp(userId);
    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error: any) {
    if (error.message === 'User not found' || error.message === 'User email is already verified') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const { token, user } = await authService.login({ username, password });
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles.map((ur: any) => ur.role.name),
        defaultRoleId: user.defaultRoleId
      }
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials' || error.message === 'Email is not verified') {
      // Return 401 for invalid credentials, 403 for not verified
      const statusCode = error.message === 'Email is not verified' ? 403 : 401;
      return res.status(statusCode).json({ error: error.message });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
};
