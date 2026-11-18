const fs=require('fs'),path=require('path'),crypto=require('crypto');
const dir=path.resolve(__dirname,'..'),project=path.resolve(dir,'../../..');
const read=file=>JSON.parse(fs.readFileSync(dir+'/evidencias/'+file,'utf8'));
const original=[...read('api-resultados.json'),...read('ui-resultados.json'),...read('adicionais.json'),...read('socket-seguranca.json'),...read('verificacao-email.json'),read('build-smoke.json'),...read('ampliacao-resultados.json')];
const matrix=read('responsividade-resultados.json');
const cases=original.map(x=>matrix.find(y=>y.id===x.id)||x).sort((a,b)=>Number(a.id.slice(2))-Number(b.id.slice(2)));
if(cases.length!==184||new Set(cases.map(x=>x.id)).size!==184||matrix.length!==64)throw Error('Suíte incompleta: não emitir relatório final');
const counts={planned:184,executed:cases.filter(x=>['aprovado','reprovado'].includes(x.status)).length,approved:cases.filter(x=>x.status==='aprovado').length,failed:cases.filter(x=>x.status==='reprovado').length,blocked:cases.filter(x=>x.status==='bloqueado').length,notExecuted:cases.filter(x=>x.status==='não executado').length};counts.percent=counts.approved/counts.executed*100;
const env=read('ambiente.json'),pg=read('postgresql.json'),browser=read('navegador.json'),benchmark=read('desempenho-amostras.json'),metrics=benchmark.metrics;
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const csv=rows=>'\ufeff'+rows.map(row=>row.map(quote).join(',')).join('\r\n');
function write(file,text){fs.writeFileSync(dir+'/'+file,text,'utf8');}
const clean=t=>String(t??'').replace(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g,'[TOKEN OMITIDO]').replace(/\x1b\[[0-9;]*m/g,'');
const esc=t=>clean(t).replaceAll('|','\\|').replace(/[\r\n]+/g,' ');
const table=items=>'| ID | Cenário | Resultado |\n|---|---|---|\n'+items.map(x=>`| ${x.id} | ${esc(x.title)} | ${x.status} |`).join('\n');
function manifest(base){const result=[];function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){if(['node_modules','dist','build','uploads','.git','.local-mail'].includes(e.name)||e.name.startsWith('.env'))continue;const p=path.join(d,e.name);if(e.isDirectory())walk(p);else result.push({path:path.relative(base,p).replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')});}}walk(base);return result;}
const before=read('source-before.json'),after={backend:manifest(project+'/backend'),frontend:manifest(project+'/frontend')},changed=[];
for(const part of ['backend','frontend']){for(const file of before[part])if(after[part].find(x=>x.path===file.path)?.sha256!==file.sha256)changed.push(part+'/'+file.path);for(const file of after[part])if(!before[part].some(x=>x.path===file.path))changed.push(part+'/'+file.path);}
write('evidencias/source-after.json',JSON.stringify(after,null,2));
write('evidencias/integridade-fontes.json',JSON.stringify({time:new Date().toISOString(),filesCompared:before.backend.length+before.frontend.length,changed,unchanged:changed.length===0,excluded:['node_modules','dist','build','uploads','.git','.local-mail','.env*']},null,2));
write('evidencias/resultados-consolidados.json',JSON.stringify({generated:new Date().toISOString(),counts,cases},null,2));
write('RESULTADOS_TESTES.csv',csv([['Identificador','Requisito/regra','Cenário','Pré-condições','Procedimento','Esperado','Obtido','Classificação','Evidência'],...cases.map(x=>[x.id,x.requirement||x.area,x.title,x.preconditions,x.procedure,x.expected,clean(x.obtained),x.status,x.evidence])]));
write('CASOS_DE_TESTE.md',`# Casos de teste — nova avaliação do CampusFácil

Execução em 18/11/2026. Foram preservados CT001–CT174 do protocolo existente em docs/testes/correcao; CT175–CT184 ampliam a avaliação de segurança e regras. Os resultados são novos, desta execução, sem reaproveitamento de classificações anteriores.

Os requisitos correspondem aos grupos da solicitação: autenticação, perfis, anúncios, solicitações, chat, avaliações, notificações/painel, chatbot, segurança, desempenho, responsividade e banco. O código e o protocolo anterior serviram de referência; não foi encontrada uma especificação formal de requisitos homologada separada. A documentação EMAIL_LOCAL.md descreve a confirmação local.

Classificações: aprovado = asserções executadas satisfeitas; reprovado = divergência observada; bloqueado = impedimento de execução; não executado = cenário não realizado. Erro 500 não é aceito como rejeição adequada de dados inválidos. Um caso aprovado não comprova ausência de falhas em cenários não testados. Nenhum serviço foi substituído por mock.

${cases.map(x=>`## ${x.id} — ${x.title}\n\n- Requisito/regra: ${x.requirement||x.area}.\n- Pré-condições: ${x.preconditions}\n- Procedimento executado: ${x.procedure}\n- Resultado esperado: ${x.expected}\n- Resultado obtido: ${clean(x.obtained)}\n- Evidência: ${x.evidence}\n- Classificação: **${x.status}**.\n`).join('\n')}`);
const findings=[
 {id:'S01',ct:'CT175',severity:'Alta',title:'Leitura de solicitações alheias pelo identificador público do anúncio',proof:'Um terceiro autenticado recebeu HTTP 200 em GET /api/advertisements/:id/service-requests, com a solicitação de outro usuário, requesterId e mensagem.',cause:'O controller envia somente advertisementId ao serviço. A consulta não aplica o ator autenticado como filtro nem verifica se ele é o prestador.',impact:'Exposição das necessidades e mensagens de solicitações de outros participantes. Não houve acesso a dados reais: todos os sujeitos eram fictícios.',recommend:'Autorizar o prestador para consultar solicitações recebidas e limitar o solicitante aos próprios registros; testar explicitamente leitura por terceiro.'},
 {id:'S02',ct:'CT176',severity:'Média',title:'Usuário comum pode criar aviso de sistema para outro participante',proof:'POST /api/notifications, chamado por C para A com type=service_request_accepted, retornou 201 sem qualquer aceite de solicitação.',cause:'O endpoint aceita recipientId, type e message diretamente do usuário, sem autorização para representar eventos de sistema.',impact:'Permite falsificar avisos internos. O ensaio não alterou o status da solicitação; demonstrou criação indevida do aviso, não execução real de contratação.',recommend:'Gerar avisos de sistema exclusivamente nos serviços que executam os eventos autorizados ou restringir severamente o endpoint público.'},
 {id:'S03',ct:'CT181',severity:'Baixa / qualidade dos dados',title:'Atualização do perfil aceita nome vazio',proof:'PUT /api/me com name vazio retornou 200. O nome fictício foi restaurado ao final do ensaio.',cause:'O campo é opcional, porém sem trim/min quando informado no schema de atualização.',impact:'Inconsistência de identidade visual e qualidade do cadastro; não foi demonstrada elevação de privilégio.',recommend:'Aplicar no perfil a mesma validação de nome exigida no cadastro; distinguir omissão do campo de valor vazio.'},
].filter(f=>cases.find(c=>c.id===f.ct)?.status==='reprovado');
const refs=`- [Socket.IO — middlewares](https://socket.io/docs/v4/middlewares/): referência para autenticar/autorização no handshake.\n- [OWASP — prevenção de IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html): referência para controle de acesso por recurso.\n- [PostgreSQL 16 — constraints](https://www.postgresql.org/docs/16/ddl-constraints.html): referência para unicidade, chaves estrangeiras e CHECK.\n\nEssas referências embasam recomendações; os resultados vêm dos ensaios locais, não das referências.`;
write('RELATORIO_SEGURANCA.md',`# Relatório de segurança — rodada atual

Testes realizados exclusivamente em ambiente local e banco isolado, com contas, mensagens e anúncios fictícios. Não houve exploração de terceiros, força bruta, DoS ou acesso a dados reais. Nenhuma correção de produção foi aplicada nesta rodada.

## Falhas reproduzidas

${findings.map(f=>`### ${f.id} — ${f.title}\n\n- Caso: **${f.ct}**. Severidade qualitativa: **${f.severity}**, sem cálculo CVSS.\n- Prova executada: ${f.proof}\n- Confirmação por inspeção: ${f.cause}\n- Impacto e limite: ${f.impact}\n- Recomendação, não implementada nesta avaliação: ${f.recommend}\n`).join('\n')}

Evidência detalhada: [requisições da ampliação](evidencias/ampliacao-http.json) e [resultados](evidencias/ampliacao-resultados.json). Cada payload usa marca de auditoria e sujeitos do banco exclusivo. Não confundir as recomendações de correção com trabalho já realizado.

## Controles aprovados nos cenários executados

- Cadastro externo e sufixos maliciosos rejeitados; confirmação pendente bloqueia login. Uso único, expiração e reenvio do link foram testados pela caixa de saída local.
- JWT inválido/expirado rejeitado no HTTP; sessão encerrada por logout rejeitada; socket da sessão encerrada desconectado.
- bcrypt confirmado por comparação real, com custo medido 12; hashes e tokens de confirmação ausentes nas respostas públicas testadas.
- Edição/exclusão e alteração de disponibilidade de anúncio alheio rejeitadas; exclusão de solicitação e alteração de notificação por terceiro rejeitadas.
- Socket.IO rejeita ausência de JWT, JWT inválido e divergência entre identidade/token; salas legítimas isoladas; histórico HTTP não vazou conversa alheia.
- Avaliação antes da conclusão, sem contratação, duplicada, fracionária ou fora de faixa foi rejeitada; média comparada ao banco.
- Payloads SQL específicos na busca/login não produziram bypass nem destruição. Título com HTML foi exibido como texto no React. SVG ativo e SVG disfarçado de PNG foram rejeitados no upload.

Esses controles não anulam S01–S03, nem demonstram ausência geral de SQL Injection/XSS. Foram testados payloads e caminhos definidos, não todas as combinações possíveis.

## Inspeção estática separada dos testes

A arquitetura usa controllers, serviços e repositórios. JWT tem sessão persistida e verificação de titularidade. O frontend guarda accessToken no localStorage. Não foi encontrado middleware explícito de rate limit nos fluxos inspecionados; isso é observação de código, não teste de força bruta. O componente de gráficos contém dangerouslySetInnerHTML para estilos; não se inferiu XSS sem prova de entrada controlável. Não houve crédito de teste por essas observações.

## Limites e referências

A entrega externa SMTP não foi testada: a confirmação usou a caixa local autorizada. Não houve avaliação de TLS público, infraestrutura, navegador móvel físico ou auditoria completa de privacidade. Dados de perfis públicos incluem e-mail institucional; a política de exposição exige decisão do projeto e não foi presumida como consentimento.

${refs}
`);
write('evidencias/desempenho-amostras.csv',csv([['Índice','Recebida','Latência_ms','HTTP'],...benchmark.samples.map(x=>[x.index,x.received,x.latencyMs,x.httpStatus])]));
write('RELATORIO_DESEMPENHO.md',`# Desempenho do chat — nova medição

Instante da rodada: ${metrics.timestamp} (UTC). Fuso do relatório: America/Sao_Paulo (UTC−03:00).

| Métrica | Resultado |
|---|---:|
| Mensagens enviadas | ${metrics.sent} |
| Mensagens recebidas | ${metrics.received} |
| Falhas | ${metrics.failures} |
| Mínima | ${metrics.minMs.toFixed(3)} ms |
| Máxima | ${metrics.maxMs.toFixed(3)} ms |
| Média | ${metrics.meanMs.toFixed(3)} ms |
| Mediana | ${metrics.medianMs.toFixed(3)} ms |
| P95 | ${metrics.p95Ms.toFixed(3)} ms |

## Método

CT058 em scripts/api.cjs: 100 mensagens sequenciais enviadas por HTTP autenticado; recebimento real no cliente Socket.IO de outro usuário. Cronômetro performance.now() no mesmo processo, do início do POST à chegada do evento correlacionado por conteúdo único (lote+índice). Timeout de entrega: 5000 ms. A medição inclui HTTP, gravação PostgreSQL e evento Socket.IO; não é apenas rede, não mede renderização da interface e não sincroniza relógios de máquinas diferentes. Nenhuma amostra foi descartada como aquecimento.

Falha = evento ausente no prazo ou HTTP diferente de 201. Mediana = média das duas posições centrais para n=100. P95 = nearest-rank, posição ceil(0,95×n) nas amostras ordenadas. Aprovação do caso significa entrega das 100 mensagens e registro das métricas; não foi definido um SLA de latência.

## Ambiente real

- ${env.platform} ${env.release}, ${env.architecture}; Node ${env.node}.
- CPU ${env.cpus}, ${env.logicalCpus} processadores lógicos; RAM total ${env.totalMemoryGB.toFixed(1)} GiB.
- ${pg.version}.
- Backend/API em 127.0.0.1:4433; Socket.IO real; banco ${env.databaseName}. Loopback na mesma máquina.
- Versões: ${Object.entries(env.versions).map(([k,v])=>k+' '+v).join('; ')}.

## Limitações

Uma rodada, um par de usuários e envio serial. Não mede concorrência, throughput máximo, WAN, rede móvel, estabilidade prolongada, hardware dedicado ou capacidade de produção. Outros processos do computador podem alterar o tempo. Não converter estes números locais em garantia de desempenho externo.

Amostras verificáveis: [JSON](evidencias/desempenho-amostras.json), [CSV](evidencias/desempenho-amostras.csv). Nenhuma medição foi reaproveitada da avaliação anterior.
`);
write('RELATORIO_RESPONSIVIDADE.md',`# Responsividade — rodada atual

64 casos: oito páginas × quatro tamanhos × dois temas. A matriz foi executada com Chromium ${browser.browser} e Playwright ${browser.tool}, headless, contra frontend/backend/banco reais.

Viewports: 360×800, 390×844, 768×1024 e 1920×1080, em CSS pixels. Páginas: inicial pública, cadastro, login, explorar, perfil do prestador, chat, painel e solicitações. Temas light/dark. A landing foi aberta sem sessão; apenas chat/painel/solicitações receberam sessão fictícia pré-carregada para a matriz. O login real foi validado separadamente.

## Critérios efetivamente executados

- Rota carrega sem redirecionamento indevido nem erro JavaScript capturado.
- Elemento principal tem largura/altura positivas, display diferente de none e visibility diferente de hidden.
- Largura do documento/body não ultrapassa viewport em mais de 2 px.
- Tema esperado aplicado à raiz.
- PNG real de cada página e imagens adicionais do chatbot nos quatro tamanhos/temas.

O primeiro ensaio de interface já cobria a matriz; uma segunda passagem com scripts/responsive.cjs confirmou os critérios explícitos de renderização do elemento principal. Os IDs CT092–CT155 são os mesmos; só uma classificação por ID entra no total. Não são 128 casos diferentes.

${table(matrix)}

## Evidências e limites

Todos os PNGs estão em evidencias/capturas, com ID, página, largura e tema no nome. Capturas completas podem ser longas; abrir na escala original para leitura. Há visualização adicional em tamanho de viewport para facilitar figuras do TCC.

Recursos externos (fontes, imagens e avatares remotos) foram bloqueados para manter o teste local; podem aparecer ausentes/fallback. Não foram mockadas APIs locais. Não foi emulado hardware físico, teclado móvel, Safari ou navegador Android/iOS. Os critérios geométricos não verificam todas as sobreposições, contraste WCAG, navegação por teclado ou usabilidade. Algumas capturas foram abertas para inspeção visual; não se afirma inspeção humana exaustiva de cada pixel.

Reprodução: scripts/ui.cjs e scripts/responsive.cjs, após scripts/api.cjs criar as contas fictícias. Dados e sessão da matriz não pertencem à conta teste do projeto.
`);
write('RELATORIO_TESTES.md',`# Avaliação técnica atual — CampusFácil

Nova execução em **18/11/2026**, America/Sao_Paulo. Início registrado: ${env.timestamp} UTC. Projeto analisado: C:\\Users\\taylor\\Desktop\\CampusFacil. Esta rodada é posterior às correções anteriores e preserva suas evidências.

## Resultado principal

Os 174 casos do protocolo anterior passaram novamente. A ampliação com dez cenários encontrou **${findings.length} falhas adicionais**. Isso demonstra o limite do escopo anterior; aprovação de uma suíte não certifica segurança absoluta. Nenhuma correção foi aplicada ao código de produção nesta rodada.

| Indicador | Total |
|---|---:|
| Planejados | ${counts.planned} |
| Executados | ${counts.executed} |
| Aprovados | ${counts.approved} |
| Reprovados | ${counts.failed} |
| Bloqueados | ${counts.blocked} |
| Não executados | ${counts.notExecuted} |
| Aprovação entre executados | ${counts.percent.toFixed(2)}% |

Percentual = aprovados ÷ (aprovados + reprovados) × 100. Retestes do mesmo ID não aumentam o total. Não foi medida cobertura de linhas. Os resultados detalhados estão no CSV e nos casos de teste.

## Análise da estrutura e documentação

- Frontend React/TypeScript, Vite, Tailwind, Framer Motion, React Router e next-themes. Telas e fluxos públicos/autenticados testados no navegador real.
- Backend Fastify com controllers, serviços e repositórios Prisma. Existem implementações in-memory, mas não foram usadas como mocks nesta avaliação.
- PostgreSQL real via Prisma 7 + adapter-pg, 17 migrações aplicadas no banco novo. Entidades de usuário, sessão, anúncio, categoria, solicitação, order, avaliação, notificação e mensagem. Foram testados persistência, unicidade, FK, CHECK e cascata.
- JWT exige sessão ativa e e-mail confirmado; bcrypt real comparado com custo 12. Logout revoga a própria sessão e desconecta sockets. Links de confirmação têm expiração/uso único; foi usada a caixa local descrita em backend/EMAIL_LOCAL.md.
- Socket.IO autenticado com JWT; isolamento, tentativa de identidade divergente, reconexão e persistência testados.
- Chatbot é FAQ pré-definido, sem modelo generativo; as seis perguntas, respostas e controles foram exercitados.
- Estados observados: prestador aceita/recusa PENDING; solicitante cancela, inicia e conclui conforme estado. Foram testadas transições válidas, inválidas e acesso por terceiros.
- O protocolo existente em docs/testes foi preservado (CT001–CT174), com ampliação CT175–CT184. Não foi encontrada uma especificação formal de requisitos homologada separada; os requisitos usados vêm da solicitação e dos fluxos/documentação existentes.
- Compilação/checagem de TypeScript passaram nas duas partes. O backend compilado foi iniciado e testado com autenticação e upload, em diretório e banco isolados.

## Isolamento e integridade

Banco novo: **${env.databaseName}**. Frontend de testes em localhost:5274; backend em 127.0.0.1:4433; ensaio do bundle em 4533. Cópias do código em runtime. Dependências e navegador instalados só para testes; não houve alteração de fonte de produção. A chave JWT e as credenciais dos sujeitos são exclusivas do ensaio.

Hashes antes/depois de ${before.backend.length+before.frontend.length} arquivos: **${changed.length} alterações detectadas**. Exclusões da comparação: dependências, build, uploads, Git, .env e caixa de e-mail local. Ver evidencias/integridade-fontes.json. Isso demonstra a integridade dos arquivos comparados, não constitui auditoria de cada arquivo do sistema operacional.

Os ensaios destrutivos usaram apenas dados fictícios. Inserções diretas de dados inválidos foram controladas no banco exclusivo, e os casos de CHECK/cascata fizeram ROLLBACK. Não foi usada nem alterada a conta teste do banco original.

## Falhas encontradas nesta rodada

${table(cases.filter(x=>x.status==='reprovado'))}

${findings.map(f=>`- **${f.ct} / ${f.severity}:** ${f.proof} Recomendação: ${f.recommend}`).join('\n')}

Detalhamento e impactos: [RELATORIO_SEGURANCA.md](RELATORIO_SEGURANCA.md). A criação indevida de uma notificação não alterou o estado real da contratação. Nome vazio é falha de validação, não elevação de privilégios. Não se aplicaram correções automaticamente.

## Desempenho e responsividade

Mensagens: ${metrics.sent} enviadas, ${metrics.received} recebidas, ${metrics.failures} falhas. Mínima ${metrics.minMs.toFixed(3)} ms; máxima ${metrics.maxMs.toFixed(3)} ms; média ${metrics.meanMs.toFixed(3)} ms; mediana ${metrics.medianMs.toFixed(3)} ms; P95 ${metrics.p95Ms.toFixed(3)} ms. Método serial local; não representa SLA nem carga de produção. [Relatório de desempenho](RELATORIO_DESEMPENHO.md).

Responsividade: 64 combinações de página/tamanho/tema, ${matrix.filter(x=>x.status==='aprovado').length} aprovadas nos critérios declarados. PNGs reais, especialmente móveis. Não equivale a certificação de acessibilidade/usabilidade. [Relatório de responsividade](RELATORIO_RESPONSIVIDADE.md).

## Ambiente e tecnologias utilizadas

${env.platform} ${env.release}, ${env.architecture}; Node ${env.node}; CPU ${env.cpus}; ${env.logicalCpus} processadores lógicos; ${env.totalMemoryGB.toFixed(1)} GiB RAM. ${pg.version}. Chromium ${browser.browser}; Playwright ${browser.tool}; socket.io-client e pg para integração. As versões detalhadas estão em evidencias/ambiente.json e evidencias/navegador.json. Sem mocks de serviços locais.

## Limitações e recomendações

Uma máquina e um Chromium headless; sem hardware móvel físico, Firefox/Safari, rede pública, SMTP real, TLS de implantação, DoS, força bruta, carga concorrente prolongada, backup/desastre ou certificação de acessibilidade. APIs externas de avatares/imagens/fontes foram bloqueadas. SQL Injection e XSS foram avaliados com payloads selecionados, não por prova de ausência em todos os caminhos. A confirmação de e-mail local valida a lógica, mas não comprova entrega numa caixa institucional real.

Priorizar autorização da leitura de solicitações, geração restrita de avisos de sistema e validação de nomes no perfil. Depois repetir os casos reprovados e a regressão. Essas são propostas, não correções executadas nesta rodada.

## Arquivos e reprodução

Documentos: RELATORIO_TESTES.md, CASOS_DE_TESTE.md, RESULTADOS_TESTES.csv, RELATORIO_SEGURANCA.md, RELATORIO_DESEMPENHO.md, RELATORIO_RESPONSIVIDADE.md e README_REPRODUCAO.md. Registros estruturados, logs e capturas em evidencias/. Lista completa em ARQUIVOS_CRIADOS.md e manifesto com SHA-256.

Veja [README_REPRODUCAO.md](README_REPRODUCAO.md) para comandos e salvaguardas. As senhas, os tokens e as configurações privadas não integram o pacote de entrega. Resultados consolidados: evidencias/resultados-consolidados.json.
`);
write('README_REPRODUCAO.md',`# Reprodução da rodada atual

Os comandos usam a pasta já criada C:\\Users\\taylor\\Desktop\\CampusFacil\\docs\\testes\\rodada_20261118_2. O pacote publicável exclui runtime, dependências, navegador, caixa de e-mail e credenciais. Os scripts de teste não corrigem o código de produção.

## Preparar outra rodada

Requer Node.js, PostgreSQL local/Docker ativo e usuário do banco autorizado a CREATE DATABASE. O .env do backend original é lido somente para acessar o servidor local e criar outro banco. Não alterar DATABASE_URL do projeto para rodar a suíte.

1. Preserve logs anteriores antes de executar novamente: os scripts sobrescrevem resultados com os mesmos nomes.
2. Crie um diretório de rodada separado dentro de docs/testes, copiando scripts/ e os arquivos package.json/package-lock.json das ferramentas do diretório docs/testes, se estiver reproduzindo em outra instalação.
3. Copie backend/src, backend/prisma, backend/scripts, package.json, package-lock.json, tsconfig.json e prisma.config.ts para runtime/backend; copie frontend/src, frontend/public, package.json, package-lock.json, tsconfig.json, vite.config.ts e index.html para runtime/frontend. Não copie .env nem .local-mail.
4. Instale ferramentas em docs/testes com npm.cmd ci --ignore-scripts; instale as dependências das duas cópias com os comandos abaixo.

~~~powershell
cd C:\\Users\\taylor\\Desktop\\CampusFacil\\docs\\testes\\rodada_20261118_2
npm.cmd ci --prefix runtime/backend --ignore-scripts --no-audit --no-fund
npm.cmd ci --prefix runtime/frontend --ignore-scripts --no-audit --no-fund
node runtime/backend/node_modules/prisma/build/index.js generate --schema runtime/backend/prisma/schema.prisma
$env:PLAYWRIGHT_BROWSERS_PATH = 'C:\\Users\\taylor\\Desktop\\CampusFacil\\docs\\testes\\runtime\\browsers'
node ../node_modules/playwright/cli.js install chromium
node scripts/prepare.cjs
~~~

prepare.cjs cria o banco campusfacil_audit_... e segredo JWT exclusivos, aplicando as migrações. Se runtime/config.private.json já existir, o banco de testes será reutilizado; para isolamento de uma rodada nova, use diretório novo sem esse arquivo. Os sujeitos são criados com identificadores/e-mails fictícios exclusivos. Não publicar arquivos *.private.json ou runtime/backend/.local-mail.

## Iniciar serviços em terminais separados

~~~powershell
cd C:\\Users\\taylor\\Desktop\\CampusFacil\\docs\\testes\\rodada_20261118_2
node scripts/start-backend.cjs
~~~

~~~powershell
cd C:\\Users\\taylor\\Desktop\\CampusFacil\\docs\\testes\\rodada_20261118_2\\runtime\\frontend
$env:VITE_API_URL = 'http://localhost:4433/api'
node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 5274 --strictPort
~~~

## Executar testes

~~~powershell
cd C:\\Users\\taylor\\Desktop\\CampusFacil\\docs\\testes\\rodada_20261118_2
node scripts/api.cjs
node scripts/ui.cjs
node scripts/additional.cjs
node scripts/socket-security.cjs
node scripts/verification-tests.cjs
node scripts/build-smoke.cjs
node scripts/extended-review.cjs
node scripts/responsive.cjs
node scripts/report-current.cjs
~~~

Os scripts funcionais registram reprovações e continuam; exit=0 não significa que todos os casos foram aprovados. Conferir sempre a classificação JSON/CSV. Se faltar parte da suíte, report-current.cjs recusa emitir relatório final. CT058 mede as 100 mensagens. Os casos de expiração preparam a condição no banco de testes, sem mock do endpoint.

Encerrar somente os terminais de teste com Ctrl+C após a rodada. O banco isolado fica preservado para inspeção; não há remoção automática. O código não deve ser corrigido como parte desta reprodução sem autorização separada.
`);
console.log(JSON.stringify(counts));
