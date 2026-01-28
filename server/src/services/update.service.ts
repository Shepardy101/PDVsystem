import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import axios from 'axios';
const pkg = require('../../package.json');

const UPDATE_CONFIG_URL = 'https://raw.githubusercontent.com/seu-usuario/seu-repo/main/version.json'; // Exemplo
const TEMP_UPDATE_PATH = path.join(process.cwd(), 'temp_update.zip');

export class UpdateService {
    private currentVersion: string = pkg.version;

    async checkUpdate() {
        try {
            console.log(`[UpdateService] Verificando atualizações... Versão atual: ${this.currentVersion}`);
            const response = await axios.get(UPDATE_CONFIG_URL);
            const remoteConfig = response.data;

            if (this.isNewerVersion(remoteConfig.version, this.currentVersion)) {
                console.log(`[UpdateService] Nova versão disponível: ${remoteConfig.version}`);
                return remoteConfig;
            }

            console.log('[UpdateService] Sistema atualizado.');
            return null;
        } catch (error) {
            console.error('[UpdateService] Erro ao verificar atualização:', error);
            return null;
        }
    }

    async downloadAndPrepare(url: string) {
        try {
            console.log(`[UpdateService] Baixando atualização de ${url}...`);
            const response = await axios({
                url,
                method: 'GET',
                responseType: 'stream',
            });

            const writer = fs.createWriteStream(TEMP_UPDATE_PATH);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    console.log('[UpdateService] Download concluído.');
                    resolve(TEMP_UPDATE_PATH);
                });
                writer.on('error', reject);
            });
        } catch (error) {
            console.error('[UpdateService] Erro no download:', error);
            throw error;
        }
    }

    triggerUpdateScript() {
        console.log('[UpdateService] Iniciando script de atualização externa...');
        const scriptPath = path.join(process.cwd(), 'atualizar-app.bat');

        // Inicia o script em um novo processo e fecha o processo atual
        const child = exec(`start cmd /c "${scriptPath}"`, {
            // @ts-ignore
            detached: true,
            stdio: 'ignore'
        } as any);

        child.unref();
        process.exit(0);
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
