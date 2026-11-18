# Reprodução da rodada atual

Os comandos usam a pasta já criada C:\Users\taylor\Desktop\CampusFacil\docs\testes\rodada_20261118_3. O pacote publicável exclui runtime, dependências, navegador, caixa de e-mail e credenciais. Os scripts de teste não corrigem o código de produção.

## Preparar outra rodada

Requer Node.js, PostgreSQL local/Docker ativo e usuário do banco autorizado a CREATE DATABASE. O .env do backend original é lido somente para acessar o servidor local e criar outro banco. Não alterar DATABASE_URL do projeto para rodar a suíte.

1. Preserve logs anteriores antes de executar novamente: os scripts sobrescrevem resultados com os mesmos nomes.
2. Crie um diretório de rodada separado dentro de docs/testes, copiando scripts/ e os arquivos package.json/package-lock.json das ferramentas do diretório docs/testes, se estiver reproduzindo em outra instalação.
3. Copie backend/src, backend/prisma, backend/scripts, package.json, package-lock.json, tsconfig.json e prisma.config.ts para runtime/backend; copie frontend/src, frontend/public, package.json, package-lock.json, tsconfig.json, vite.config.ts e index.html para runtime/frontend. Não copie .env nem .local-mail.
4. Instale ferramentas em docs/testes com npm.cmd ci --ignore-scripts; instale as dependências das duas cópias com os comandos abaixo.

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes\rodada_20261118_3
npm.cmd ci --prefix runtime/backend --ignore-scripts --no-audit --no-fund
npm.cmd ci --prefix runtime/frontend --ignore-scripts --no-audit --no-fund
node runtime/backend/node_modules/prisma/build/index.js generate --schema runtime/backend/prisma/schema.prisma
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\Users\taylor\Desktop\CampusFacil\docs\testes\runtime\browsers'
node ../node_modules/playwright/cli.js install chromium
node scripts/prepare.cjs
~~~

prepare.cjs cria o banco campusfacil_audit_... e segredo JWT exclusivos, aplicando as migrações. Se runtime/config.private.json já existir, o banco de testes será reutilizado; para isolamento de uma rodada nova, use diretório novo sem esse arquivo. Os sujeitos são criados com identificadores/e-mails fictícios exclusivos. Não publicar arquivos *.private.json ou runtime/backend/.local-mail.

## Iniciar serviços em terminais separados

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes\rodada_20261118_3
node scripts/start-backend.cjs
~~~

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes\rodada_20261118_3\runtime\frontend
$env:VITE_API_URL = 'http://localhost:4433/api'
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5274 --strictPort
~~~

## Executar testes

~~~powershell
cd C:\Users\taylor\Desktop\CampusFacil\docs\testes\rodada_20261118_3
node scripts/api.cjs
node scripts/ui.cjs
node scripts/additional.cjs
node scripts/socket-security.cjs
node scripts/verification-tests.cjs
node scripts/build-smoke.cjs
node scripts/extended-review.cjs
node scripts/focus-three.cjs
node scripts/report-current.cjs
~~~

Os scripts funcionais registram reprovações e continuam; exit=0 não significa que todos os casos foram aprovados. Conferir sempre a classificação JSON/CSV. Se faltar parte da suíte, report-current.cjs recusa emitir relatório final. CT058 mede as 100 mensagens. Os casos de expiração preparam a condição no banco de testes, sem mock do endpoint.

Encerrar somente os terminais de teste com Ctrl+C após a rodada. O banco isolado fica preservado para inspeção; não há remoção automática. O código não deve ser corrigido como parte desta reprodução sem autorização separada.
