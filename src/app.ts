import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import masterRoutes from './routes/master.routes';
import qcRoutes from './routes/qc.routes';
import uploadRoutes from './routes/upload.routes';
import settingRoutes from './routes/setting.routes';
import produksiRoutes from './routes/produksi.routes';
import gudangRoutes from './routes/gudang.routes';
import { errorHandler } from './middlewares/errorHandler.middleware';

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  'https://myiamseed.com',
  'https://www.myiamseed.com',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) : []),
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isAllowed =
      allowedOrigins.includes(origin) ||
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
      /^https?:\/\/([a-zA-Z0-9-]+\.)*myiamseed\.com$/.test(origin);

    if (isAllowed || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  optionsSuccessStatus: 200,
};

// 1. CORS Middleware (Must be before all routes and body parsers)
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 2. Helmet - configured to allow cross-origin resource sharing for static files & API
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 3. Logger & Body Parsers
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/qc', qcRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/produksi', produksiRoutes);
app.use('/api/gudang', gudangRoutes);

app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
  res.send('API SERVER IS READY');
});

// Global Error Handler
app.use(errorHandler);

export default app;
