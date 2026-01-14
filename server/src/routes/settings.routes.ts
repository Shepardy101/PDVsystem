import { Router } from 'express';
import { getSetting, setSetting, getAllSettings } from '../repositories/settings.repo';
import { logEvent } from '../utils/audit';

const settingsRouter = Router();

// Buscar todas as configurações
settingsRouter.get('/', async (req, res) => {
  try {
    const settings = await getAllSettings();
    res.json(settings);
  } catch (e) {
    logEvent('Erro ao buscar configurações', 'error', { message: (e as any)?.message || String(e), stack: (e as any)?.stack });
    res.status(500).json({ error: 'Erro ao buscar configurações', details: e });
  }
});

// Buscar configuração específica
settingsRouter.get('/:key', async (req, res) => {
  try {
    const value = await getSetting(req.params.key);
    if (value === null) return res.status(404).json({ error: 'Configuração não encontrada' });
    res.json({ key: req.params.key, value });
  } catch (e) {
    logEvent('Erro ao buscar configuração', 'error', { key: req.params.key, message: (e as any)?.message || String(e), stack: (e as any)?.stack });
    res.status(500).json({ error: 'Erro ao buscar configuração', details: e });
  }
});

// Atualizar configuração (ex: senha admin)
settingsRouter.put('/:key', async (req, res) => {
  try {
    const { value, oldValue } = req.body;
    if (req.params.key === 'admin_password') {
      const current = await getSetting('admin_password');
      if (!oldValue || oldValue !== current) {
        return res.status(403).json({ error: 'Senha atual incorreta' });
      }
    }
    await setSetting(req.params.key, value);
    logEvent('Configuração atualizada', 'info', { key: req.params.key, value });
    res.json({ key: req.params.key, value });
  } catch (e) {
    logEvent('Erro ao atualizar configuração', 'error', { key: req.params.key, message: (e as any)?.message || String(e), stack: (e as any)?.stack });
    res.status(500).json({ error: 'Erro ao atualizar configuração', details: e });
  }
});

export default settingsRouter;
