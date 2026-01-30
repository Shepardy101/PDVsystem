import { downloadDriveVersionJson, getTempVersionJson } from '../services/driveVersion.service';
import { Router } from 'express';
import { updateService } from '../services/update.service';

const router = Router();

// Checa versão do Google Drive e executa atualização se necessário
router.get('/check-drive', async (req, res) => {
    try {
        // Baixa o version.json do Google Drive
        await downloadDriveVersionJson();
        const remote = getTempVersionJson();
        if (!remote?.version) return res.status(400).json({ error: 'version.json inválido ou não encontrado.' });

        const status = updateService.getUpdateStatus();
        const current = status.currentVersion;
        // Compara versões
        const isNewer = ((): boolean => {
            const r = remote.version.split('.').map(Number);
            const l = current.split('.').map(Number);
            for (let i = 0; i < 3; i++) {
                if (r[i] > l[i]) return true;
                if (r[i] < l[i]) return false;
            }
            return false;
        })();

        if (isNewer) {
            // Roda atualizar-app.bat para baixar atualização
            updateService.triggerUpdateScript();
            return res.json({ updateAvailable: true, remoteVersion: remote.version, currentVersion: current });
        }
        return res.json({ updateAvailable: false, remoteVersion: remote.version, currentVersion: current });
    } catch (err: any) {
        return res.status(500).json({ error: err.message || 'Erro ao checar versão do Drive.' });
    }
});


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
