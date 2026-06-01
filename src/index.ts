import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import barRoutes from './routes/barRoutes';

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/statbar';

app.use(cors());
app.use(express.json());

app.get('/health', (_req: Request, res: Response) => {
  const dbState = mongoose.connection.readyState;
  res.json({
    status: 'ok',
    service: 'api-bar',
    db: dbState === 1 ? 'connected' : 'disconnected',
  });
});

app.use('/api/bars', barRoutes);

app.use((err: Error & { status?: number; name?: string }, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api-bar] error:', err);
  const status = err.status ?? (err.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[api-bar] MongoDB connected: ${MONGODB_URI}`);
  } catch (err) {
    console.error('[api-bar] MongoDB connection failed:', err);
  }

  app.listen(PORT, () => {
    console.log(`[api-bar] listening on http://localhost:${PORT}`);
  });
}

start();
