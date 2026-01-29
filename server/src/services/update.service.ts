import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import axios from 'axios';
import { logEvent } from '../utils/audit';

const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const UPDATE_CONFIG_URL = 'https://raw.githubusercontent.com/Shepardy22/pdvsys-check-version/main/version.json';
const TEMP_UPDATE_PATH = path.join(process.cwd(), 'temp_update.zip');

export class UpdateService {
    private currentVersion: string = pkg.version;

    isUpdateReady() {
        return fs.existsSync(TEMP_UPDATE_PATH);
    }

    getUpdateStatus() {
        return {
            currentVersion: this.currentVersion,
            isUpdateReady: this.isUpdateReady(),
            updatePath: TEMP_UPDATE_PATH
        };
    }

    cleanupUpdate() {
        if (this.isUpdateReady()) {
            try {
                fs.unlinkSync(TEMP_UPDATE_PATH);
                console.log('[UpdateService] Pacote de atualização antigo removido (Limpeza).');
            } catch (err) {
                console.warn('[UpdateService] Falha ao remover pacote temporário:', err);
            }
        }
    }

    async checkUpdate() {
        try {
            console.log(`[UpdateService] Verificando atualizações... Versão atual: ${this.currentVersion}`);
            const response = await axios.get(UPDATE_CONFIG_URL);
            const remoteConfig = response.data;

            if (this.isNewerVersion(remoteConfig.version, this.currentVersion)) {
                logEvent(`[UpdateService] Nova versão disponível: ${remoteConfig.version}. Versão atual: ${this.currentVersion}`, 'info');
                return remoteConfig;
            }

            // Se chegamos aqui, o sistema já está na versão remota
            // Se houver um lixo de zip antigo, limpamos agora
            this.cleanupUpdate();

            console.log('[UpdateService] Sistema atualizado.');
            return null;
        } catch (error: any) {
            if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
                console.log('[UpdateService] Sem conexão com servidor de atualizações (DNS/Offline).');
            } else {
                logEvent(`[UpdateService] Erro ao verificar atualização: ${error.message || error}`, 'error');
            }
            return null;
        }
    }

    async downloadAndPrepare(url: string) {
        try {
            console.log(`[UpdateService] 📥 Iniciando download da atualização: ${url}`);
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
            });

            const writer = fs.createWriteStream(TEMP_UPDATE_PATH);

            // Log de progresso simplificado
            let downloadedBytes = 0;
            response.data.on('data', (chunk: Buffer) => {
                downloadedBytes += chunk.length;
                if (downloadedBytes % (1024 * 1024) === 0) { // Log a cada 1MB
                    console.log(`[UpdateService] 🔄 Progresso: ${(downloadedBytes / 1024 / 1024).toFixed(2)} MB baixados...`);
                }
            });

            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log(`[UpdateService] ✅ Download concluído com sucesso! Arquivo salvo em: ${TEMP_UPDATE_PATH}`);
                    console.log(`[UpdateService] 🚀 O sistema está pronto para ser atualizado.`);
                    resolve(TEMP_UPDATE_PATH);
                });
                writer.on('error', (err) => {
                    console.error('[UpdateService] ❌ Erro ao gravar arquivo no disco:', err);
                    reject(err);
                });
            });
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.error(`[UpdateService] ❌ Falha no download: O link da atualização não foi encontrado (Erro 404).`);
                console.error(`[UpdateService] 🔗 Verifique se o arquivo existe em: ${url}`);
            } else {
                console.error('[UpdateService] ❌ Falha crítica no download:', error.message || error);
            }
            throw error;
        }
    }

    triggerUpdateScript() {
        logEvent('[UpdateService] Acionando script de atualização externa com privilégios de Administrador...', 'warn');
        const scriptPath = path.join(process.cwd(), 'atualizar-app.bat');

        try {
            // Para garantir que o script .bat rode como admin, usamos o PowerShell com 'Start-Process -Verb RunAs'
            // Isso abrirá um novo prompt solicitando permissão (UAC) ou rodará direto se o usuário já tiver privilégios
            const psCommand = `Start-Process -FilePath "${scriptPath}" -Verb RunAs -WindowStyle Normal`;

            const child = spawn('powershell', ['-Command', psCommand], {
                detached: true,
                stdio: 'ignore',
                shell: true,
                windowsHide: false // Precisamos que a janela apareça para o usuário ver o progresso (ou o prompt UAC)
            });

            child.unref();
            logEvent('[UpdateService] Comando de elevação enviado. Encerrando processo principal...', 'info');

            setTimeout(() => {
                process.exit(0);
            }, 1500);
        } catch (err: any) {
            logEvent(`[UpdateService] Falha crítica ao disparar script elevado: ${err.message}`, 'error');
        }
    }

    private isNewerVersion(remote: string, local: string): boolean {
        const r = remote.split('.').map(Number);
        const l = local.split('.').map(Number);

        for (let i = 0; i < 3; i++) {
            if (r[i] > l[i]) return true;
            if (r[i] < l[i]) return false;
        }
        return false;
    }
}

export const updateService = new UpdateService();
