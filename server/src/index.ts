import express from 'express';
import cors from 'cors';
import path from 'path';
import { healthRouter } from './routes/health.routes';
import adminDbRouter from './routes/adminDb.routes';
import { productRouter } from './routes/product.routes';
import { posRouter } from './routes/pos.routes';
import { cashRouter } from './routes/cash.routes';
import { cashHistoryRouter } from './routes/cash.history.routes';
import { categoryRouter } from './routes/category.routes';
import { userRouter } from './routes/user.routes';
import { clientRouter } from './routes/user.routes';

import supplierRouter from './routes/supplier.routes';
import reportRouter from './routes/report.routes';
import reportsRouter from './routes/reports.routes';
import settingsRouter from './routes/settings.routes';
import sysRouter from './routes/sys';
import ipControlRouter from './routes/admin/ipControl.routes';

import { ipAccessControl } from './middleware/ipAccessControl';
const app = express();

app.use(cors());
app.use(express.json());

// Controle de IPs admin
app.use('/api/admin/ip-control', ipControlRouter);


// Servir arquivos da pasta public/uploads
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));


// Middleware de controle de IPs (aplica em todas as rotas exceto admin-db, health, ip-control, uploads)
app.use((req, res, next) => {
  const skip = req.path.startsWith('/api/health') || req.path.startsWith('/api/admin-db') || req.path.startsWith('/api/admin/ip-control') || req.path.startsWith('/uploads');
  if (skip) return next();
  return ipAccessControl(req, res, next);
});

// Servir arquivos estáticos do frontend (dist)
const distPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distPath));

const PORT = Number(process.env.PORT) || 8787;


// Health check
app.use('/api/health', healthRouter);

// DB Manager admin
app.use('/api/admin-db', adminDbRouter);


app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/clients', clientRouter);
app.use('/api/suppliers', supplierRouter);




app.use('/api/cash', cashRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/cash', cashHistoryRouter);
app.use('/api/pos', posRouter);
app.use('/api/report', reportRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/sys', sysRouter);


// SPA: qualquer rota não-API retorna index.html (depois do middleware de IP)
app.get('*', (req, res) => {
  // Não sobrescrever rotas de API ou uploads
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT} (ou pelo IP local)`);
});
