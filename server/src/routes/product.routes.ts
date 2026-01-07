import { Router } from 'express';
import {
  listProducts,
  searchProducts,
  createProduct,
  updateProduct,
  getProductById
} from '../repositories/product.repo';

export const productRouter = Router();

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
  try {
    const { items } = searchProducts(q);
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro na busca.' } });
  }
});

productRouter.post('/', (req, res) => {
  try {
    console.log('[POST /api/products] Recebido:', req.body);
    const product = createProduct(req.body);
    console.log('[POST /api/products] Produto criado com sucesso:', product);
    res.status(201).json({ product });
  } catch (err: any) {
    console.error('[POST /api/products] Erro ao criar produto:', err);
    if (err.code === 'VALIDATION_ERROR') {
      res.status(400).json({ error: { code: err.code, message: err.message } });
    } else if (err.code === 'DUPLICATE_EAN') {
      res.status(409).json({ error: { code: err.code, message: err.message } });
    } else if (err.code === 'DUPLICATE_INTERNAL_CODE') {
      res.status(409).json({ error: { code: err.code, message: err.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar produto.' } });
    }
  }
});

productRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const product = updateProduct(id, req.body);
    res.json({ product });
  } catch (err: any) {
    if (err.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: err.code, message: err.message } });
    } else if (err.code === 'VALIDATION_ERROR') {
      res.status(400).json({ error: { code: err.code, message: err.message } });
    } else if (err.code === 'DUPLICATE_EAN') {
      res.status(409).json({ error: { code: err.code, message: err.message } });
    } else if (err.code === 'DUPLICATE_INTERNAL_CODE') {
      res.status(409).json({ error: { code: err.code, message: err.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar produto.' } });
    }
  }
});
