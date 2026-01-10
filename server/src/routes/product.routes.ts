// Rota para remover imagem de produto
// --- mover para depois da declaração do productRouter ---

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
  destination: function (req, file, cb) {
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
productRouter.delete('/', (req, res) => {
  try {
    const deleted = deleteAllProducts();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao deletar todos os produtos.' } });
  }
});

// Deletar produto por ID
productRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log(`[DELETE /api/products/${id}] Iniciando deleção do produto.`);
  try {
    deleteProduct(id);
    console.log(`[DELETE /api/products/${id}] Produto removido com sucesso.`);
    res.status(204).send();
  } catch (err: any) {
    console.error(`[DELETE /api/products/${id}] Erro ao remover produto:`, err);
    if (err.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: err.code, message: err.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao deletar produto.', details: err && err.message ? err.message : err } });
    }
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
      const product = createProduct({
        ...req.body,
        type: req.body.type || 'product',
      });
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
      const product = updateProduct(id, {
        ...req.body,
        type: req.body.type,
      });
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
