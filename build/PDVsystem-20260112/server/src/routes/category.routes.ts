import { Router } from 'express';
import {
  listCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
  updateCategory
} from '../repositories/category.repo';

export const categoryRouter = Router();

categoryRouter.get('/', (req, res) => {
  try {
    const items = listCategories();
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar categorias.' } });
  }
});

categoryRouter.post('/', (req, res) => {
  try {
    const { name } = req.body;
    const category = createCategory(name);
    res.status(201).json({ category });
  } catch (err: any) {
    if (err.code === 'DUPLICATE') {
      res.status(409).json({ error: { code: err.code, message: err.message } });
    } else if (err.code === 'VALIDATION_ERROR') {
      res.status(400).json({ error: { code: err.code, message: err.message } });
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao criar categoria.' } });
    }
  }
});

categoryRouter.delete('/:id', (req, res) => {
  try {
    deleteCategory(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao deletar categoria.' } });
  }
});

categoryRouter.put('/:id', (req, res) => {
  try {
    updateCategory(req.params.id, req.body.name);
    res.status(200).end();
  } catch (err) {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar categoria.' } });
  }
});
