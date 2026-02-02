# 15 - Sistema de Atualizações

## Visão Geral

O PDVsystem utiliza um processo **manual** de atualização que permite aplicar novas versões de forma controlada e segura.

---

## Processo de Atualização

### 1. Preparar Nova Versão

1. **Aumente a versão** no `package.json`:
   ```json
   {
     "version": "1.0.27"
   }
   ```

2. **Gere o pacote de release**:
   ```bash
   # Execute o script de empacotamento
   package-app.bat
   ```
   
   Isso criará: `build/PDVsystem-release.zip`

### 2. Aplicar Atualização no Cliente

1. **Copie o arquivo** `PDVsystem-release.zip` para o servidor do cliente

2. **Renomeie** o arquivo para `update.zip`

3. **Extraia** a pasta `update` na raiz do projeto:
   ```
   C:\PDVsystem\
   └── update\
       ├── dist\
       ├── server\
       ├── public\
       └── ...
   ```

4. **Execute o script de atualização**:
   ```bash
   atualizar-app.bat
   ```

### 3. O Que o Script Faz

O `atualizar-app.bat` realiza automaticamente:

1. ✅ Para o servidor (via PM2)
2. ✅ Faz backup da pasta `data` (banco de dados)
3. ✅ Substitui arquivos antigos pelos novos
4. ✅ Preserva configurações (`.env`, `data/`)
5. ✅ Limpa a pasta `update`
6. ✅ Reinicia o servidor (via PM2)

---

## Estrutura do Pacote de Release

O arquivo `PDVsystem-release.zip` contém:

```
PDVsystem-release.zip
├── dist/                    # Frontend buildado
├── server/
│   └── dist/               # Backend buildado
├── public/
│   └── uploads/            # Pasta de uploads (vazia)
├── data/                   # Pasta do banco (vazia)
├── scripts/                # Scripts de automação
├── package.json            # Dependências
├── *.bat                   # Scripts Windows
└── README.md              # Documentação
```

---

## Backup e Segurança

> [!WARNING]
> **Sempre faça backup do banco de dados antes de atualizar!**

### Backup Manual

Copie a pasta `data/` antes de atualizar:
```bash
# Crie um backup
xcopy C:\PDVsystem\data C:\PDVsystem\backup\data-YYYYMMDD /E /I
```

### Arquivos Preservados

O script de atualização **preserva automaticamente**:
- ✅ `data/` - Banco de dados SQLite
- ✅ `.env` - Variáveis de ambiente
- ✅ `public/uploads/` - Imagens de produtos

---

## Verificação Pós-Atualização

Após atualizar, verifique:

1. **Servidor rodando**:
   ```bash
   pm2 status
   ```

2. **Versão atualizada**:
   - Acesse: `http://localhost:8787`
   - Verifique o número da versão no rodapé

3. **API funcionando**:
   ```bash
   curl http://localhost:8787/api/health
   ```

4. **Logs sem erros**:
   ```bash
   pm2 logs PDVsystem
   ```

---

## Troubleshooting

### Atualização Falhou

Se algo der errado:

1. **Restaure o backup**:
   ```bash
   xcopy C:\PDVsystem\backup\data-YYYYMMDD C:\PDVsystem\data /E /I /Y
   ```

2. **Reinstale dependências**:
   ```bash
   npm install
   ```

3. **Reconstrua o projeto**:
   ```bash
   npm run build
   ```

4. **Reinicie o servidor**:
   ```bash
   pm2 restart PDVsystem
   ```

### Servidor Não Inicia

1. Verifique logs: `pm2 logs PDVsystem`
2. Verifique porta: `netstat -ano | findstr :8787`
3. Execute migrations: `npm run migrate`

---

## Notas Importantes

> [!IMPORTANT]
> **Permissões:** O sistema precisa de permissão de escrita na pasta de instalação.

> [!NOTE]
> **Dependências:** Se houver mudanças no `package.json`, execute `npm install` após a atualização.

> [!TIP]
> **Automação:** Para múltiplos clientes, você pode criar um script que distribua e aplique atualizações remotamente via SSH/RDP.

---

## Histórico de Versões

Consulte o [CHANGELOG.md](../CHANGELOG.md) para ver o histórico completo de mudanças entre versões.

---

## Referências

- [Instalação e Execução](09-instalacao-e-execucao.md)
- [Automação Windows e PM2](10-automacao-windows-e-pm2.md)
- [Troubleshooting](13-troubleshooting.md)
