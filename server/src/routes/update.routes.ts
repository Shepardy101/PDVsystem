import { Router } from 'express';
import { updateService } from '../services/update.service';

const router = Router();

router.get('/status', (req, res) => {
    res.json(updateService.getUpdateStatus());
});

router.get('/check', async (req, res) => {
    const update = await updateService.checkUpdate();
    res.json({ update });
});

router.post('/apply', async (req, res) => {
    const { url } = req.body;

    try {
        // Se a URL for 'local' ou não fornecida, verificamos se o patch já existe
        if ((!url || url === 'local') && updateService.isUpdateReady()) {
            console.log('[UpdateService] Aplicando patch já existente localmente...');
        } else if (url && url !== 'local') {
            await updateService.downloadAndPrepare(url);
        } else {
            return res.status(400).json({ error: 'Nenhuma atualização pronta e nenhuma URL fornecida.' });
        }

        res.json({ message: 'O sistema será reiniciado em instantes para aplicar a atualização.' });

        // Aciona o script de atualização externa
        setTimeout(() => {
            updateService.triggerUpdateScript();
        }, 2000);
    } catch (error: any) {
        console.error('[UpdateService] Erro ao preparar aplicação:', error.message || error);
        res.status(500).json({ error: 'Falha ao preparar atualização: ' + (error.message || 'Erro interno') });
    }
});

export default router;
