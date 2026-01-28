import { Router } from 'express';
import { updateService } from '../services/update.service';

const router = Router();

router.get('/check', async (req, res) => {
    const update = await updateService.checkUpdate();
    res.json({ update });
});

router.post('/apply', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL da atualização não fornecida' });

    try {
        await updateService.downloadAndPrepare(url);
        res.json({ message: 'Download concluído. O sistema será reiniciado para aplicar a atualização.' });

        // Pequeno atraso para o cliente receber a resposta antes do sistema fechar
        setTimeout(() => {
            updateService.triggerUpdateScript();
        }, 2000);
    } catch (error) {
        res.status(500).json({ error: 'Falha ao baixar atualização' });
    }
});

export default router;
