# Guia do Sistema de Atualizações Automáticas

Este documento explica como funciona, como configurar e como utilizar o sistema de atualizações automáticas do **PDVsystem**.

---

## 1. Visão Geral do Funcionamento

O sistema de atualização é composto por três partes principais:

1.  **Backend (UpdateService):** Monitora se há novas versões e baixa o pacote.
2.  **Script Externo (`atualizar-app.bat`):** Realiza a substituição dos arquivos físicos enquanto o sistema está parado.
3.  **Hospedagem Remota:** O local onde você coloca o arquivo de configuração (`version.json`) e o pacote compactado (`.zip`).

### Fluxo de Atualização:
1. O servidor inicia e verifica a versão no `version.json` remoto.
2. Se a versão remota for maior que a local (ex: `1.0.1` > `1.0.0`), o download do `.zip` é iniciado.
3. O arquivo é salvo como `temp_update.zip` na raiz do projeto.
4. Quando disparado (manualmente ou automaticamente), o sistema executa o `atualizar-app.bat` e encerra o processo Node.js.
5. O script `.bat` para o PM2, extrai o ZIP, substitui os arquivos e reinicia o PM2.

---

## 2. Como Preparar uma Atualização

Para enviar uma atualização para seus clientes, siga estes passos:

1.  **Aumente a versão:** No arquivo `package.json`, altere o campo `"version"`. Ex: de `"0.0.0"` para `"1.0.0"`.
2.  **Gere o pacote:** Execute o script `package-app.bat` na raiz do projeto.
    - Isso criará um arquivo em `build/PDVsystem-release.zip`.
3.  **Renomeie o pacote (Opcional):** Você pode renomear para algo como `update-v1.0.0.zip`.

---

## 3. Como Hospedar a Atualização

Você precisa de um servidor web onde os clientes possam baixar os arquivos. Uma forma simples e gratuita é usar o **GitHub**:

1. Crie um repositório (ou use o atual).
2. Crie um arquivo chamado `version.json` com o seguinte conteúdo:
   ```json
   {
     "version": "1.0.0",
     "url": "https://link-direto-para-seu-arquivo/update-v1.0.0.zip"
   }
   ```
3. Suba o arquivo `.zip` e o `version.json` para o seu servidor/repositório.

---

## 4. Configurando o Cliente

No arquivo `server/src/services/update.service.ts`, você deve configurar a constante `UPDATE_CONFIG_URL` com o link direto (Raw) para o seu `version.json`.

```typescript
const UPDATE_CONFIG_URL = 'https://raw.githubusercontent.com/usuario/repo/main/version.json';
```

---

## 5. Comandos de API

Você pode interagir com o sistema de atualização através dos seguintes endpoints:

- **Verificar Atualização:** `GET /api/update/check`
  - Retorna se há uma versão nova disponível.
- **Aplicar Atualização:** `POST /api/update/apply`
  - Body: `{"url": "link_do_zip"}`
  - Faz o download imediato e reinicia o sistema em 2 segundos.

---

## 6. Considerações Importantes

> [!WARNING]
> **Backup do Banco de Dados:** Embora o script de atualização tente preservar a pasta `data`, é sempre recomendável que o cliente tenha backups regulares do arquivo `novabev.sqlite`.

> [!IMPORTANT]
> **Permissões:** O sistema deve ter permissão de escrita na pasta onde está instalado para que o script `.bat` consiga substituir os arquivos.

> [!NOTE]
> Se houver mudanças nas dependências do `package.json`, o cliente precisará rodar `npm install` novamente. O script `instalar-app.bat` já faz isso, mas em atualizações automáticas rápidas, focamos na substituição de arquivos de código (`dist` e `server/dist`).
