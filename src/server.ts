import 'dotenv/config';
import app from './app';
import { initMinio } from './utils/minio';

const PORT = process.env.PORT || 8080;

initMinio()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize MinIO storage, server not started:', err);
    process.exit(1);
  });
