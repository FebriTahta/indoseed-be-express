import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import masterRoutes from './routes/master.routes';
import qcRoutes from './routes/qc.routes';
import uploadRoutes from './routes/upload.routes';
import produksiRoutes from './routes/produksi.routes';
import gudangRoutes from './routes/gudang.routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/master', masterRoutes);
app.use('/api/qc', qcRoutes);
app.use('/api/upload', uploadRoutes);
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

export default app;
