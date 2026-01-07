import express from 'express';
import cors from 'cors';
import path from 'path';
import { healthRouter } from './routes/health.routes.ts';
import { productRouter } from './routes/product.routes.ts';
import { posRouter } from './routes/pos.routes.ts';
import { cashRouter } from './routes/cash.routes.ts';
import { categoryRouter } from './routes/category.routes.ts';

const app = express();
const PORT = Number(process.env.PORT) || 8787;

app.use(cors());
app.use(express.json());

// Health check
app.use('/api/health', healthRouter);

app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);


app.use('/api/cash', cashRouter);
app.use('/api/pos', posRouter);

// Static serving (prod)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../../dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT} (ou pelo IP local)`);
});
