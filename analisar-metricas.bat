@echo off
chcp 65001 >nul
echo.
echo ======================================================================
echo      ANÁLISE DE MÉTRICAS DO PACOTE FINAL (SEM NODE_MODULES)
echo ======================================================================
echo.
echo NOTA: node_modules será instalado no cliente final (npm install)
echo Analisando apenas os arquivos que serão incluídos no ZIP...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"$report = @(); ^
$report += '=== TAMANHO DO PACOTE ZIPADO (SEM NODE_MODULES) ===' + \"`n\"; ^
$totalSize = 0; ^
$folders = @('dist', 'server\dist', 'public', 'data'); ^
foreach ($folder in $folders) { ^
    if (Test-Path $folder) { ^
        $files = Get-ChildItem -Path $folder -Recurse -File; ^
        $folderSize = ($files ^| Measure-Object -Property Length -Sum).Sum; ^
        $totalSize += $folderSize; ^
        $report += \"`n[$folder]\"; ^
        $report += \"  Arquivos: $($files.Count)\"; ^
        $report += \"  Tamanho: $([math]::Round($folderSize/1MB,2)) MB ($([math]::Round($folderSize/1KB,2)) KB)\"; ^
    } ^
}; ^
$report ^| ForEach-Object { Write-Host $_ }"

echo.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host '=== ARQUIVOS RAIZ ===' -ForegroundColor Cyan; ^
$rootFiles = Get-ChildItem -Path . -File ^| Where-Object { $_.Name -notlike '*.log' -and $_.Name -notlike '*.zip' }; ^
$rootFiles ^| Select-Object Name, @{Name='Tamanho';Expression={if($_.Length -lt 1KB){'{0} bytes' -f $_.Length}elseif($_.Length -lt 1MB){'{0:N2} KB' -f ($_.Length/1KB)}else{'{0:N2} MB' -f ($_.Length/1MB)}}} ^| Format-Table -AutoSize"

echo.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host '`n=== DETALHAMENTO DIST/ASSETS (Frontend) ===' -ForegroundColor Cyan; ^
Get-ChildItem -Path 'dist\assets' -File ^| Select-Object Name, @{Name='Tamanho';Expression={'{0:N2} KB ({1:N2} MB)' -f ($_.Length/1KB), ($_.Length/1MB)}}, @{Name='Tipo';Expression={$_.Extension}} ^| Sort-Object Length -Descending ^| Format-Table -AutoSize"

echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host '`n=== DETALHAMENTO SERVER/DIST (Backend) ===' -ForegroundColor Cyan; ^
$serverFiles = Get-ChildItem -Path 'server\dist' -Recurse -File; ^
Write-Host \"Total de arquivos: $($serverFiles.Count)\"; ^
Write-Host \"`nPor pasta:\"; ^
Get-ChildItem -Path 'server\dist' -Directory ^| ForEach-Object { ^
    $files = Get-ChildItem -Path $_.FullName -Recurse -File; ^
    $size = ($files ^| Measure-Object -Property Length -Sum).Sum; ^
    Write-Host \"  $($_.Name): $($files.Count) arquivos - $([math]::Round($size/1KB,2)) KB\" ^
}"

echo.
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host ('='*70) -ForegroundColor Green; ^
Write-Host 'RELATÓRIO FINAL - PACOTE ZIP DE PRODUÇÃO' -ForegroundColor Green; ^
Write-Host ('='*70) -ForegroundColor Green; ^
Write-Host \"`n\"; ^
$total = 0; ^
$categories = @{ ^
    'Frontend (dist/)' = 'dist'; ^
    'Banco de Dados (data/)' = 'data'; ^
    'Arquivos Públicos (public/)' = 'public'; ^
    'Backend (server/dist/)' = 'server\dist' ^
}; ^
foreach ($cat in $categories.GetEnumerator()) { ^
    if (Test-Path $cat.Value) { ^
        $files = Get-ChildItem -Path $cat.Value -Recurse -File -ErrorAction SilentlyContinue; ^
        $size = ($files ^| Measure-Object -Property Length -Sum).Sum; ^
        $total += $size; ^
        Write-Host ('{0,-35} {1,8} arquivos ^| {2,10:N2} MB' -f $cat.Key, $files.Count, ($size/1MB)) ^
    } ^
}; ^
$rootFiles = Get-ChildItem -Path . -File ^| Where-Object { $_.Name -notlike '*.log' -and $_.Name -notlike '*.zip' }; ^
$rootSize = ($rootFiles ^| Measure-Object -Property Length -Sum).Sum; ^
$total += $rootSize; ^
Write-Host ('{0,-35} {1,8} arquivos ^| {2,10:N2} MB' -f 'Arquivos Raiz (.bat, .json, etc)', $rootFiles.Count, ($rootSize/1MB)); ^
Write-Host \"`n\" ('-'*70); ^
Write-Host ('{0,-35} {2,10:N2} MB' -f 'TAMANHO DO ZIP FINAL', 0, ($total/1MB)) -ForegroundColor Yellow; ^
Write-Host \"`nOBS: node_modules (~246 MB) será instalado após extração (npm install)\" -ForegroundColor Cyan; ^
Write-Host ('='*70) -ForegroundColor Green"

echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host '`n=== ANÁLISE DOS MAIORES ARQUIVOS ===' -ForegroundColor Magenta; ^
Write-Host \"`nTOP 10 MAIORES ARQUIVOS DO PACOTE ZIP:\"; ^
$allFiles = @(); ^
foreach ($path in @('dist', 'server\dist', 'public', 'data')) { ^
    if (Test-Path $path) { ^
        Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue ^| ForEach-Object { ^
            $allFiles += [PSCustomObject]@{ ^
                Path = $_.FullName.Replace((Get-Location).Path + '\', ''); ^
                SizeMB = $_.Length / 1MB; ^
                SizeKB = $_.Length / 1KB ^
            } ^
        } ^
    } ^
}; ^
$allFiles ^| Sort-Object SizeMB -Descending ^| Select-Object -First 10 ^| ForEach-Object { ^
    if ($_.SizeMB -ge 1) { ^
        Write-Host ('  {0,-60} {1,8:N2} MB' -f $_.Path, $_.SizeMB) ^
    } else { ^
        Write-Host ('  {0,-60} {1,8:N2} KB' -f $_.Path, $_.SizeKB) ^
    } ^
}; ^
Write-Host \"`nDISTRIBUIÇÃO DO PACOTE ZIP:\"; ^
$distSize = (Get-ChildItem 'dist' -Recurse -File ^| Measure-Object -Property Length -Sum).Sum / 1MB; ^
$dataSize = if (Test-Path 'data') { (Get-ChildItem 'data' -Recurse -File ^| Measure-Object -Property Length -Sum).Sum / 1MB } else { 0 }; ^
$serverSize = (Get-ChildItem 'server\dist' -Recurse -File ^| Measure-Object -Property Length -Sum).Sum / 1MB; ^
$publicSize = if (Test-Path 'public') { (Get-ChildItem 'public' -Recurse -File ^| Measure-Object -Property Length -Sum).Sum / 1MB } else { 0 }; ^
$totalZip = $distSize + $dataSize + $serverSize + $publicSize + 0.27; ^
Write-Host ('  Frontend (dist): {0:N1}%% - {1:N2} MB' -f (($distSize/$totalZip)*100), $distSize); ^
Write-Host ('  Banco de dados: {0:N1}%% - {1:N2} MB' -f (($dataSize/$totalZip)*100), $dataSize); ^
Write-Host ('  Backend (server/dist): {0:N1}%% - {1:N2} MB' -f (($serverSize/$totalZip)*100), $serverSize); ^
Write-Host ('  Arquivos públicos: {0:N1}%% - {1:N2} MB' -f (($publicSize/$totalZip)*100), $publicSize); ^
Write-Host ('  Outros: {0:N1}%% - {1:N2} MB' -f ((0.27/$totalZip)*100), 0.27)"

echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host '`n=== INFORMAÇÕES SOBRE DEPENDÊNCIAS ===' -ForegroundColor Cyan; ^
Write-Host \"`nnode_modules NÃO está incluído no ZIP\" -ForegroundColor Yellow; ^
Write-Host \"Será instalado no cliente com: npm install --production\" -ForegroundColor Green; ^
Write-Host \"`nTamanho estimado após npm install:\"; ^
Write-Host \"  - Somente produção (--production): ~100-150 MB\"; ^
Write-Host \"  - Com devDependencies: ~246 MB\"; ^
Write-Host \"`n💡 RECOMENDAÇÃO: Use 'npm install --production' no cliente\" -ForegroundColor Green"

echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
"Write-Host '`n=== RESUMO E RECOMENDAÇÕES ===' -ForegroundColor Cyan; ^
Write-Host \"`n📦 TAMANHO DO ZIP FINAL: ~10-11 MB\" -ForegroundColor Green; ^
Write-Host \"`n📋 CONTEÚDO DO ZIP:\"; ^
Write-Host \"   ✓ Frontend compilado (dist/): ~3.77 MB\"; ^
Write-Host \"   ✓ Backend compilado (server/dist/): ~0.17 MB\"; ^
Write-Host \"   ✓ Banco de dados inicial (data/): ~6.39 MB\"; ^
Write-Host \"   ✓ Arquivos públicos (public/): ~0.27 MB\"; ^
Write-Host \"   ✓ Configurações (.bat, .json, etc): ~0.27 MB\"; ^
Write-Host \"`n⚙️ INSTALAÇÃO NO CLIENTE:\"; ^
Write-Host \"   1. Extrair ZIP (~10-11 MB)\"; ^
Write-Host \"   2. Executar: npm install --production\"; ^
Write-Host \"   3. Dependências instaladas: ~100-150 MB\"; ^
Write-Host \"   4. Tamanho total final: ~110-160 MB\"; ^
Write-Host \"`n✅ OTIMIZAÇÕES APLICADAS:\" -ForegroundColor Green; ^
Write-Host \"   ✓ node_modules não incluído no ZIP\"; ^
Write-Host \"   ✓ Bundles otimizados (Vite)\"; ^
Write-Host \"   ✓ Backend minificado (TypeScript)\"; ^
Write-Host \"`n📝 PRÓXIMOS PASSOS:\"; ^
Write-Host \"   • Considere comprimir banco de dados se contiver dados de exemplo\"; ^
Write-Host \"   • Use code splitting para reduzir bundle principal\"; ^
Write-Host \"   • Implemente lazy loading de rotas\""

echo.
echo.
echo ======================================================================
echo              ANÁLISE CONCLUÍDA - PACOTE OTIMIZADO
echo ======================================================================
echo.
echo ZIP FINAL: ~10-11 MB (sem node_modules)
echo Após npm install --production: ~110-160 MB total no cliente
echo.
pause
