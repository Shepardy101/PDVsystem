
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  listProducts,
  searchProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  deleteAllProducts
} from '../repositories/product.repo';

export const productRouter = Router();

import fs from 'fs';


// SSE: lista de conexões
import { Response } from 'express';
const sseClients: Response[] = [];


// Log de todas as requisições recebidas neste router
productRouter.use((req, res, next) => {
  console.log(`[API][${new Date().toISOString()}] ${req.method} ${req.originalUrl} | Query:`, req.query, '| Body:', req.body);
  next();
});

// Rota SSE para eventos de produtos
productRouter.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();
  sseClients.push(res);
  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

function emitProductEvent(eventType: string, payload: unknown) {
  const data = `event: ${eventType}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try { client.write(data); } catch {}
  });
}
// Rota para remover imagem de produto
// --- mover para depois da declaração do productRouter ---


productRouter.post('/delete-image', async (req, res) => {
  const { imageUrl, productId } = req.body;
  if (!imageUrl || !productId) return res.status(400).json({ error: 'Dados insuficientes.' });
  try {
    // Remove arquivo físico
    const filePath = path.resolve(__dirname, '../../../', imageUrl.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    // Limpa campo imageUrl no banco
    updateProduct(productId, { imageUrl: '' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover imagem.' });
  }
});

// Configuração do multer para salvar imagens
const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, path.resolve(__dirname, '../../../public/uploads'));
  },
  filename: function (req, file, cb) {
    // Usa id do produto e descrição para nome do arquivo
    const { ean, description } = req.body;
    const ext = path.extname(file.originalname);
    const safeDesc = description ? description.replace(/[^a-zA-Z0-9-_]/g, '_') : '';
    const safeEan = ean ? String(ean).replace(/[^a-zA-Z0-9-_]/g, '_') : 'new';
    cb(null, `${safeEan}_${safeDesc}_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage });

// Rota para upload de imagem
productRouter.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    // Caminho relativo para salvar no banco
    const relativePath = `/uploads/${req.file.filename}`;
    res.json({ imageUrl: relativePath });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar imagem.' });
  }
});

// Deletar TODOS os produtos
productRouter.delete('/', (_req, res) => {
  try {
    deleteAllProducts();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao deletar todos os produtos.' } });
  }
});

// Buscar produto por ID (deve ficar após a declaração de productRouter)
productRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const product = getProductById(id);
    if (!product) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Produto não encontrado.' } });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao buscar produto.' } });
  }
});

productRouter.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  try {
    const { items, total } = listProducts(limit, offset);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar produtos.' } });
  }
});

productRouter.get('/search', (req, res) => {
  const q = (req.query.q as string) || '';
  console.log(`[API] /api/products/search chamada. Query recebida: '${q}'`);
  try {
    const { items } = searchProducts(q);
    console.log(`[API] /api/products/search resultado: ${items.length} itens encontrados.`);
    res.json({ items });
  } catch (err) {
    console.error(`[API] /api/products/search erro:`, err);
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro na busca.' } });
  }
});

productRouter.post('/', (req, res) => {
  try {
    console.log('[POST /api/products] Recebido:', req.body);
    const product = createProduct({
      ...req.body,
      type: req.body.type || 'product',
    });
    console.log('[POST /api/products] Produto criado com sucesso:', product);
    emitProductEvent('created', product);
    res.status(201).json({ product });
  } catch (err) {
    console.error('[POST /api/products] Erro ao criar produto:', err);
    if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
      const code = (err as { code: string; message: string }).code;
      const message = (err as { code: string; message: string }).message;
      if (code === 'VALIDATION_ERROR') {
        res.status(400).json({ error: { code, message } });
      } else if (code === 'DUPLICATE_EAN') {
        res.status(409).json({ error: { code, message } });
      } else if (code === 'DUPLICATE_INTERNAL_CODE') {
        res.status(409).json({ error: { code, message } });
      } else {
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar produto.' } });
      }
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar produto.' } });
    }
  }
});

productRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const product = updateProduct(id, {
      ...req.body,
      type: req.body.type,
    });
    emitProductEvent('updated', product);
    res.json({ product });
  } catch (err) {
    if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
      const code = (err as { code: string; message: string }).code;
      const message = (err as { code: string; message: string }).message;
      if (code === 'NOT_FOUND') {
        res.status(404).json({ error: { code, message } });
      } else if (code === 'VALIDATION_ERROR') {
        res.status(400).json({ error: { code, message } });
      } else if (code === 'DUPLICATE_EAN') {
        res.status(409).json({ error: { code, message } });
      } else if (code === 'DUPLICATE_INTERNAL_CODE') {
        res.status(409).json({ error: { code, message } });
      } else {
        res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar produto.' } });
      }
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar produto.' } });
    }
  }
});

// Deletar produto individual (emitir evento SSE)
productRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    deleteProduct(id);
    emitProductEvent('deleted', { id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao deletar produto.' } });
  }
});
