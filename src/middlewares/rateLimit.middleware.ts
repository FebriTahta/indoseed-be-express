import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5, // Limit each IP to 5 login requests per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Terlalu banyak percobaan masuk. Silakan coba lagi setelah 15 menit.'
  }
});

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 5 registration requests per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Terlalu banyak percobaan pendaftaran. Silakan coba lagi setelah 1 jam.'
  }
});
