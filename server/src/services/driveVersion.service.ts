import fs from 'fs';
import path from 'path';
import axios from 'axios';

const VERSION_ID_PATH = path.join(process.cwd(), 'version_id.txt');
const TEMP_VERSION_PATH = path.join(process.cwd(), 'temp_version.json');

export async function downloadDriveVersionJson() {
  // Lê o ID do arquivo version_id.txt
  const id = fs.readFileSync(VERSION_ID_PATH, 'utf8').trim();
  if (!id) throw new Error('ID do arquivo version.json do Google Drive não encontrado.');
  // Monta a URL de download direto do Google Drive
  const url = `https://drive.google.com/uc?export=download&id=${id}`;
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(TEMP_VERSION_PATH);
  response.data.pipe(writer);
  await new Promise<void>((resolve, reject) => {
    writer.on('finish', () => resolve());
    writer.on('error', reject);
  });
  return TEMP_VERSION_PATH;
}

export function getTempVersionJson() {
  if (!fs.existsSync(TEMP_VERSION_PATH)) return null;
  const raw = fs.readFileSync(TEMP_VERSION_PATH, 'utf8');
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
