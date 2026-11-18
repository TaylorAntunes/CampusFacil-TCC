# Avaliação técnica atual — CampusFácil

Nova execução em **18/11/2026**, America/Sao_Paulo. Início registrado: 2026-11-18T16:18:37.718Z UTC. Projeto analisado: C:\Users\taylor\Desktop\CampusFacil. Esta rodada é posterior às correções anteriores e preserva suas evidências.

## Resultado principal

Os 174 casos do protocolo anterior passaram novamente. A ampliação com dez cenários encontrou **3 falhas adicionais**. Isso demonstra o limite do escopo anterior; aprovação de uma suíte não certifica segurança absoluta. Nenhuma correção foi aplicada ao código de produção nesta rodada.

| Indicador | Total |
|---|---:|
| Planejados | 184 |
| Executados | 184 |
| Aprovados | 181 |
| Reprovados | 3 |
| Bloqueados | 0 |
| Não executados | 0 |
| Aprovação entre executados | 98.37% |

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

Banco novo: **campusfacil_audit_20261118161837**. Frontend de testes em localhost:5274; backend em 127.0.0.1:4433; ensaio do bundle em 4533. Cópias do código em runtime. Dependências e navegador instalados só para testes; não houve alteração de fonte de produção. A chave JWT e as credenciais dos sujeitos são exclusivas do ensaio.

Hashes antes/depois de 282 arquivos: **0 alterações detectadas**. Exclusões da comparação: dependências, build, uploads, Git, .env e caixa de e-mail local. Ver evidencias/rodada_20261118_2/integridade-fontes.json. Isso demonstra a integridade dos arquivos comparados, não constitui auditoria de cada arquivo do sistema operacional.

Os ensaios destrutivos usaram apenas dados fictícios. Inserções diretas de dados inválidos foram controladas no banco exclusivo, e os casos de CHECK/cascata fizeram ROLLBACK. Não foi usada nem alterada a conta teste do banco original.

## Falhas encontradas nesta rodada

| ID | Cenário | Resultado |
|---|---|---|
| CT175 | Leitura de solicitações de terceiros por anúncio | reprovado |
| CT176 | Criação de aviso de sistema para terceiro | reprovado |
| CT181 | Nome vazio na atualização do perfil | reprovado |

- **CT175 / Alta:** Um terceiro autenticado recebeu HTTP 200 em GET /api/advertisements/:id/service-requests, com a solicitação de outro usuário, requesterId e mensagem. Recomendação: Autorizar o prestador para consultar solicitações recebidas e limitar o solicitante aos próprios registros; testar explicitamente leitura por terceiro.
- **CT176 / Média:** POST /api/notifications, chamado por C para A com type=service_request_accepted, retornou 201 sem qualquer aceite de solicitação. Recomendação: Gerar avisos de sistema exclusivamente nos serviços que executam os eventos autorizados ou restringir severamente o endpoint público.
- **CT181 / Baixa / qualidade dos dados:** PUT /api/me com name vazio retornou 200. O nome fictício foi restaurado ao final do ensaio. Recomendação: Aplicar no perfil a mesma validação de nome exigida no cadastro; distinguir omissão do campo de valor vazio.

Detalhamento e impactos: [RELATORIO_SEGURANCA.md](RELATORIO_SEGURANCA.md). A criação indevida de uma notificação não alterou o estado real da contratação. Nome vazio é falha de validação, não elevação de privilégios. Não se aplicaram correções automaticamente.

## Desempenho e responsividade

Mensagens: 100 enviadas, 100 recebidas, 0 falhas. Mínima 7.784 ms; máxima 14.677 ms; média 10.341 ms; mediana 10.090 ms; P95 12.560 ms. Método serial local; não representa SLA nem carga de produção. [Relatório de desempenho](RELATORIO_DESEMPENHO.md).

Responsividade: 64 combinações de página/tamanho/tema, 64 aprovadas nos critérios declarados. PNGs reais, especialmente móveis. Não equivale a certificação de acessibilidade/usabilidade. [Relatório de responsividade](RELATORIO_RESPONSIVIDADE.md).

## Ambiente e tecnologias utilizadas

win32 10.0.26200, x64; Node v24.19.0; CPU Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz; 12 processadores lógicos; 15.9 GiB RAM. PostgreSQL 16.16 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit. Chromium 159.0.8154.6; Playwright 1.65.1; socket.io-client e pg para integração. As versões detalhadas estão em evidencias/rodada_20261118_2/ambiente.json e evidencias/rodada_20261118_2/navegador.json. Sem mocks de serviços locais.

## Limitações e recomendações

Uma máquina e um Chromium headless; sem hardware móvel físico, Firefox/Safari, rede pública, SMTP real, TLS de implantação, DoS, força bruta, carga concorrente prolongada, backup/desastre ou certificação de acessibilidade. APIs externas de avatares/imagens/fontes foram bloqueadas. SQL Injection e XSS foram avaliados com payloads selecionados, não por prova de ausência em todos os caminhos. A confirmação de e-mail local valida a lógica, mas não comprova entrega numa caixa institucional real.

Priorizar autorização da leitura de solicitações, geração restrita de avisos de sistema e validação de nomes no perfil. Depois repetir os casos reprovados e a regressão. Essas são propostas, não correções executadas nesta rodada.

## Arquivos e reprodução

Documentos: RELATORIO_TESTES.md, CASOS_DE_TESTE.md, RESULTADOS_TESTES.csv, RELATORIO_SEGURANCA.md, RELATORIO_DESEMPENHO.md, RELATORIO_RESPONSIVIDADE.md e README_REPRODUCAO.md. Registros estruturados, logs e capturas em evidencias/rodada_20261118_2/. Lista completa em ARQUIVOS_CRIADOS.md e manifesto com SHA-256.

Veja [README_REPRODUCAO.md](README_REPRODUCAO.md) para comandos e salvaguardas. As senhas, os tokens e as configurações privadas não integram o pacote de entrega. Resultados consolidados: evidencias/rodada_20261118_2/resultados-consolidados.json.


## Atualização posterior — correção dos três casos

CT175, CT176 e CT181 foram corrigidos e aprovados em uma rodada de 96 testes de API/integração/regressão. Consulte [RELATORIO_CORRECOES](correcao_3/RELATORIO_CORRECOES.md). Os números acima permanecem como registro da avaliação anterior; a matriz completa não foi repetida nesta correção.
