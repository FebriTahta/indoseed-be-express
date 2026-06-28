import { Request, Response, NextFunction } from 'express';

export const verifyTurnstile = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.body.captchaToken;

  if (!token) {
    return res.status(400).json({ error: 'Captcha verification is required' });
  }

  const secretKey = process.env.CLOUDFLARE_TURNISTILE_SECRET_KEY;

  if (!secretKey) {
    console.error('CLOUDFLARE_TURNISTILE_SECRET_KEY is not defined in env');
    return res.status(500).json({ error: 'Captcha configuration missing on server' });
  }

  try {
    const ip = req.ip;
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip || '',
      }).toString(),
    });

    const data = (await response.json()) as {
      success: boolean;
      'error-codes'?: string[];
    };

    if (!data.success) {
      console.warn('Turnstile verification failed:', data['error-codes']);
      return res.status(400).json({ error: 'Selesaikan verifikasi captcha dengan benar' });
    }

    next();
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan sistem saat memvalidasi captcha' });
  }
};
