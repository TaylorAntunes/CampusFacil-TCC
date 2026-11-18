# Reprodução dos testes

O pacote não contém credenciais, tokens, dependências ou navegador. Os fontes de produção não foram corrigidos. A cópia usada na execução foi preservada em runtime para inspeção local, mas não é incluída no pacote publicável.

## Pré-requisitos

Windows, Node.js 24, PostgreSQL local ativo, dependências originais do backend/frontend instaladas. A instalação Docker do usuário fica fora do PATH; iniciar o mesmo compose do backend quando necessário. O usuário do PostgreSQL precisa de permissão CREATE DATABASE. Não usar banco remoto/produção.

## Preparação

No PowerShell, na raiz do projeto, crie cópias para teste (sem copiar .env nem node_modules):

~~~powershell
$projeto = 'C:\Users\taylor\Desktop\CampusFacil'
$audit = Join-Path $projeto 'docs\testes'
New-Item -ItemType Directory -Force "$audit\runtime\backend", "$audit\runtime\frontend", "$audit\runtime\backend\uploads" | Out-Null
Copy-Item "$projeto\backend\src", "$projeto\backend\prisma", "$projeto\backend\package.json", "$projeto\backend\tsconfig.json", "$projeto\backend\prisma.config.ts" "$audit\runtime\backend" -Recurse -Force
Copy-Item "$projeto\frontend\src", "$projeto\frontend\public", "$projeto\frontend\package.json", "$projeto\frontend\package-lock.json", "$projeto\frontend\tsconfig.json", "$projeto\frontend\vite.config.ts", "$projeto\frontend\index.html" "$audit\runtime\frontend" -Recurse -Force
cd $audit
npm.cmd ci --ignore-scripts --no-audit --no-fund
npm.cmd ci --prefix runtime/frontend --ignore-scripts --no-audit --no-fund
$env:PLAYWRIGHT_BROWSERS_PATH = "$audit\runtime\browsers"
node node_modules/playwright/cli.js install chromium
node scripts/prepare.cjs
~~~

prepare.cjs lê o .env do backend original, cria um banco novo de nome campusfacil_audit_... e um segredo exclusivo de JWT; não imprime esses valores. Configuração fica em runtime/config.private.json. Se esse arquivo já existe, reutiliza apenas o banco de teste previamente criado; não faz reset nem altera banco original. Para rodada totalmente nova, use diretório de execução separado ou renomeie o arquivo privado anterior antes de preparar. Preserve os resultados anteriores antes de rodar de novo, pois logs/relatórios são sobrescritos.

## Iniciar instâncias (dois terminais)

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes
node scripts/start-backend.cjs
~~~

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes\runtime\frontend
$env:VITE_API_URL = 'http://localhost:4333/api'
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5174 --strictPort
~~~

## Executar a suíte (terceiro terminal)

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes
node scripts/api.cjs
node scripts/ui.cjs
node scripts/retest-ui-message.cjs
node scripts/retest-landing.cjs
node scripts/additional.cjs
node scripts/socket-security.cjs
node scripts/report.cjs
~~~

Falhas de asserção são registradas por caso, e os scripts continuam para cobrir os demais cenários. Exit=0 da suíte não significa que todos os casos passaram; verificar classificação no JSON/CSV. Falha estrutural interrompida gera log/interrupção e não deve ser interpretada como teste aprovado.

O teste CT058 mede as 100 entregas. As operações destrutivas são apenas sobre entidades fictícias no banco isolado. O ensaio SQL de CHECK e o de cascata fazem ROLLBACK. A execução gera dados deliberadamente inválidos quando detecta uma falha; não aproveitar esse banco como banco real.

Encerrar terminais de teste com Ctrl+C após a rodada. O banco isolado é preservado para inspeção; sua remoção não foi automatizada. Não copiar .private.json para anexos do TCC.

## Interpretação

Use os relatórios completos e o protocolo dos casos. Não selecionar apenas casos aprovados para afirmar segurança geral. Os 64 casos de responsividade têm critérios geométricos definidos e não equivalem a auditoria de acessibilidade. As medições locais não representam latência na Internet.
