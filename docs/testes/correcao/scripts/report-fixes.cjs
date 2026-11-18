const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=path.resolve(__dirname,'..'),project=path.resolve(dir,'../../..'),root=path.resolve(dir,'..');
const read=(file)=>JSON.parse(fs.readFileSync(dir+'/evidencias/'+file,'utf8'));
const original=JSON.parse(fs.readFileSync(root+'/evidencias/resultados-consolidados.json','utf8'));
let results=[...read('api-resultados.json'),...read('ui-resultados.json'),...read('adicionais.json'),...read('socket-seguranca.json'),...read('verificacao-email.json'),read('build-smoke.json')];
const replacement=read('ui-reteste-CT080.json');results=results.map(x=>x.id===replacement.id?replacement:x);
const failedBefore=original.cases.filter(x=>x.status==='reprovado');
const comparison=failedBefore.map(before=>({id:before.id,scenario:before.title,before:before.status,after:results.find(x=>x.id===before.id)?.status||'não executado',obtained:results.find(x=>x.id===before.id)?.obtained,evidence:results.find(x=>x.id===before.id)?.evidence}));
const counts={planned:results.length,executed:results.filter(x=>['aprovado','reprovado'].includes(x.status)).length,approved:results.filter(x=>x.status==='aprovado').length,failed:results.filter(x=>x.status==='reprovado').length,blocked:results.filter(x=>x.status==='bloqueado').length,previousFailures:failedBefore.length,previousFailuresNowApproved:comparison.filter(x=>x.after==='aprovado').length};
fs.writeFileSync(dir+'/evidencias/resultados-consolidados.json',JSON.stringify({date:new Date().toISOString(),counts,results,comparison},null,2));
const quote=x=>'"'+String(x??'').replaceAll('"','""')+'"';
const csv=(rows)=>'\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
fs.writeFileSync(dir+'/RESULTADOS_RETESTES.csv',csv([['ID','Cenário','Esperado','Obtido','Classificação','Evidência'],...results.map(x=>[x.id,x.title,x.expected,x.obtained,x.status,x.evidence])]));
fs.writeFileSync(dir+'/COMPARATIVO_26.csv',csv([['ID','Cenário','Antes','Depois','Obtido','Evidência'],...comparison.map(x=>[x.id,x.scenario,x.before,x.after,x.obtained,x.evidence])]));
const before=JSON.parse(fs.readFileSync(root+'/evidencias/source-before.json','utf8'));
function manifest(base){const files=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','dist','build','uploads','.git','.local-mail'].includes(e.name)||e.name.startsWith('.env'))continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else files.push({path:path.relative(base,p).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}}walk(base);return files;}
const changes=[];for(const part of ['backend','frontend'])for(const file of manifest(project+'/'+part)){const old=before[part].find(x=>x.path===file.path);if(old?.sha256!==file.sha256)changes.push({path:part+'/'+file.path,kind:old?'modificado':'criado',beforeSha256:old?.sha256||null,afterSha256:file.sha256});}
fs.writeFileSync(dir+'/evidencias/arquivos-alterados.json',JSON.stringify(changes,null,2));
const table='| ID | Cenário | Antes | Reteste |\n|---|---|---|---|\n'+comparison.map(x=>`| ${x.id} | ${x.scenario} | ${x.before} | ${x.after} |`).join('\n');
const report=`# Correções e retestes — CampusFácil

Execução: 18/11/2026, America/Sao_Paulo. Correções autorizadas pelo autor após a avaliação inicial. A avaliação original foi preservada em docs/testes e no pacote CampusFacil-avaliacao-inicial.zip.

## Resultado

- Casos reprovados originalmente: **${counts.previousFailures}**.
- Desses, aprovados após correção: **${counts.previousFailuresNowApproved}**.
- Total executado na nova rodada: **${counts.executed}** (${counts.previousFailures} regressões originalmente falhas, os demais casos originais e 8 casos adicionais).
- Aprovados: **${counts.approved}**; reprovados: **${counts.failed}**; bloqueados: **${counts.blocked}**.
- Os casos CT001–CT166 mantêm seus identificadores; CT167–CT174 foram acrescentados para confirmação, sessões e execução do bundle.

Esses resultados são cenários efetivamente executados, não garantia de ausência de outras falhas. A aprovação da matriz responsiva continua limitada aos critérios documentados no relatório inicial.

## Correções implementadas

1. **Respostas sem hashes e segredos:** serialização do perfil aplicada à lista de prestadores e ao upload; hashes de senha e de confirmação não são retornados.
2. **Socket.IO autenticado:** handshake exige JWT assinado e sessão ativa; sala é derivada do sub validado. userId divergente é recusado. Frontend envia o token. O logout desconecta os sockets da sessão encerrada.
3. **Permissões:** exclusão de solicitação exige solicitante/prestador; atualização de notificação exige destinatário; erros de autorização retornam 403.
4. **Validação:** nome/título/descrição/mensagem com trim e limites; preço não negativo; estrelas inteiras entre 1 e 5; erros de entrada e duplicação mapeados para 400/409 em vez de 500.
5. **Fluxos acadêmicos:** autocontratação proibida; avaliação exige solicitação concluída do avaliador e serviço de outro prestador.
6. **Imagens:** PNG/JPEG/WebP com assinatura compatível; SVG recusado no upload; extensões controladas; nosniff e CSP restritiva nos arquivos servidos. Conteúdo histórico não foi removido.
7. **Titularidade institucional:** cadastro cria conta pendente; link de uso único, expiração de 30 minutos e hash no banco; login bloqueado até confirmar; reenvio e interface de confirmação implementados.
8. **Sessões e logout:** sessão persistida com expiração e revogação; JWT anterior da sessão encerrada deixa de acessar /me. Outras sessões independentes continuam válidas até serem encerradas ou expirarem.
9. **Banco:** migração adiciona campos de confirmação, sessões e CHECKs de preço/faixa de avaliação. CHECKs NOT VALID preservam registros históricos e passam a proteger novas escritas; não houve exclusão ou correção silenciosa de dados antigos.
10. **Compilação:** contratos dos repositórios e controllers antigos corrigidos; build com TypeScript e esbuild declarado como dependência de desenvolvimento. O bundle foi executado contra banco isolado e testado com login/upload real.

## Confirmação local, conforme escolha do autor

O modo de entrega local grava links somente em **backend/.local-mail/*.json**. A API não devolve o token. A caixa foi usada para testes; não houve envio real para um servidor SMTP. Esse modo não comprova recepção em uma caixa de correio institucional real. Em produção, a aplicação exige SMTP e bloqueia entrega local. Leia backend/EMAIL_LOCAL.md.

Contas anteriores sem confirmação não foram marcadas como verificadas automaticamente. A conta teste recebeu um link na caixa local. Sessões anteriores à migração devem entrar novamente. Não publicar .local-mail nem arquivos *.private.json.

## Comparativo dos 26 casos

${table}

## Novas verificações

- CT167: cadastro pelo navegador não cria sessão automática e solicita confirmação.
- CT168: consumo de link local pela interface libera login.
- CT169: link já consumido é recusado.
- CT170: token aleatório é recusado.
- CT171: token expirado é recusado (pré-condição de expiração preparada por SQL no banco de teste).
- CT172: reenvio gera outro link; anterior permanece inválido; token não é exposto pela API.
- CT173: logout encerra socket e revoga a mesma sessão; novo login funciona.
- CT174: backend compilado inicia, autentica, recebe PNG e serve o arquivo no diretório de teste correto.

## Ajustes do protocolo, sem mascarar falhas

A criação das contas de ensaio passou a consumir o link da caixa local antes do login, porque agora a autenticação exige confirmação. CT012 passou a criar uma conta pendente e verificar a rejeição real do login. Os casos negativos de socket passaram a esperar connect_error, pois a conexão agora é rejeitada antes de entrar em sala. O teste de logout usa o JWT da própria sessão encerrada, e não um token de outra sessão independente. CT080 teve reteste real aguardando o POST assíncrono de logout; sua tentativa inicial foi preservada com o token ocultado. Nenhuma aprovação foi atribuída apenas pela leitura do código.

## Ambiente, evidências e reprodução

Outro PostgreSQL isolado: ${read('ambiente.json').databaseName}. Backend 4433; frontend 5274; Chromium real, HTTP, PostgreSQL e Socket.IO reais. Sem mocks de serviço. Recursos externos bloqueados nas capturas, como na rodada inicial. Banco do projeto recebeu a migração não destrutiva após os ensaios iniciais de correção; dados reais não foram usados nos ataques/ensaios.

Scripts executados em correcao/scripts: api.cjs, ui.cjs, additional.cjs, socket-security.cjs, verification-tests.cjs, retest-logout.cjs e build-smoke.cjs. Instâncias isoladas e credenciais ficam no runtime privado. Os scripts correspondem às novas regras descritas acima. Logs completos e respostas sanitizadas ficam em correcao/evidencias.

Para repetir a correção, use a mesma preparação isolada da avaliação inicial, com o código corrigido e portas 4433/5274; execute esses scripts na ordem listada. Copie dependências/lockfiles e rode prisma generate também no backend isolado antes de compilar essa cópia. O arquivo correcao/scripts/prepare.cjs cria o banco de teste; não use uma URL de produção.

Resultados tabulares: [RESULTADOS_RETESTES.csv](correcao/RESULTADOS_RETESTES.csv) e [COMPARATIVO_26.csv](correcao/COMPARATIVO_26.csv). Dados estruturados: correcao/evidencias/resultados-consolidados.json. Lista dos arquivos alterados: correcao/evidencias/arquivos-alterados.json.

## Arquivos alterados (${changes.length})

${changes.map(x=>'- '+x.kind+': \x60'+x.path+'\x60').join('\n')}

## Limites que permanecem

Sem SMTP real configurado, a entrega institucional externa ainda não foi testada. Não houve teste em Internet, ataque de carga/DoS, hardware móvel físico ou certificação de acessibilidade. O teste de 100 mensagens é local e serial. Não se afirma segurança absoluta nem prontidão de produção baseada apenas nesta rodada. Configuração SMTP e revisão de implantação devem anteceder uso público.
`;
fs.writeFileSync(root+'/RELATORIO_CORRECOES.md',report);
fs.writeFileSync(dir+'/RELATORIO_CORRECOES.md',report.replaceAll('(correcao/','('));
console.log(JSON.stringify(counts));
if(counts.failed||counts.previousFailuresNowApproved!==26)process.exitCode=1;
