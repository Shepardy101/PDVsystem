// utils/secureStorage.ts
// Funções para encriptar e desencriptar dados do localStorage sem bibliotecas externas

// Chave secreta simples (ideal: gerar dinamicamente ou usar algo mais seguro)
const SECRET_KEY = 'pdv@2026!';

// Função para converter string para base64
function toBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

// Função para converter base64 para string
function fromBase64(str: string): string {
  return decodeURIComponent(escape(atob(str)));
}

// Função simples de "encriptação" (XOR + base64)
export function encryptObject(obj: any): string {
  const json = JSON.stringify(obj);
  let encrypted = '';
  for (let i = 0; i < json.length; i++) {
    encrypted += String.fromCharCode(json.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
  }
  return toBase64(encrypted);
}

// Função de "desencriptação" (base64 + XOR)
export function decryptObject(data: string): any {
  try {
    const encrypted = fromBase64(data);
    let decrypted = '';
    for (let i = 0; i < encrypted.length; i++) {
      decrypted += String.fromCharCode(encrypted.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length));
    }
    return JSON.parse(decrypted);
  } catch {
    return null;
  }
}

// Função para salvar no localStorage de forma segura
export function setSecureItem(key: string, value: any) {
  const encrypted = encryptObject(value);
  localStorage.setItem(key, encrypted);
}

// Função para ler do localStorage de forma segura
export function getSecureItem(key: string): any {
  const encrypted = localStorage.getItem(key);
  if (!encrypted) return null;
  return decryptObject(encrypted);
}
