# Avaliação técnica atual — CampusFácil

Nova execução em **18/11/2026**, America/Sao_Paulo. Início registrado: 2026-11-18T16:33:25.317Z UTC. Projeto analisado: C:\Users\taylor\Desktop\CampusFacil. Esta rodada é posterior às correções anteriores e preserva suas evidências.

## Resultado principal

Os identificadores CT001–CT195 foram preservados. Nesta execução, foram observados **0 casos reprovados**. Aprovação de uma suíte não certifica segurança absoluta. Nenhuma correção foi aplicada ao código de produção nesta rodada.

| Indicador | Total |
|---|---:|
| Planejados | 195 |
| Executados | 195 |
| Aprovados | 195 |
| Reprovados | 0 |
| Bloqueados | 0 |
| Não executados | 0 |
| Aprovação entre executados | 100.00% |

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

Banco novo: **campusfacil_audit_20261118163324**. Frontend de testes em localhost:5274; backend em 127.0.0.1:4433; ensaio do bundle em 4533. Cópias do código em runtime. Dependências e navegador instalados só para testes; não houve alteração de fonte de produção. A chave JWT e as credenciais dos sujeitos são exclusivas do ensaio.

Hashes antes/depois de 283 arquivos: **0 alterações detectadas**. Exclusões da comparação: dependências, build, uploads, Git, .env e caixa de e-mail local. Ver evidencias/rodada_20261118_3/integridade-fontes.json. Isso demonstra a integridade dos arquivos comparados, não constitui auditoria de cada arquivo do sistema operacional.

Os ensaios destrutivos usaram apenas dados fictícios. Inserções diretas de dados inválidos foram controladas no banco exclusivo, e os casos de CHECK/cascata fizeram ROLLBACK. Não foi usada nem alterada a conta teste do banco original.

## Falhas encontradas nesta rodada

Nenhum caso foi reprovado nos cenários executados desta rodada.



Detalhamento e impactos: [RELATORIO_SEGURANCA.md](RELATORIO_SEGURANCA.md). Os resultados históricos e as correções anteriores estão preservados em docs/testes/historico, nas rodadas anteriores e nos relatórios de correção. Não se aplicaram correções automaticamente nesta rodada.

## Desempenho e responsividade

Mensagens: 100 enviadas, 100 recebidas, 0 falhas. Mínima 7.727 ms; máxima 17.454 ms; média 11.019 ms; mediana 10.662 ms; P95 13.327 ms. Método serial local; não representa SLA nem carga de produção. [Relatório de desempenho](RELATORIO_DESEMPENHO.md).

Responsividade: 64 combinações de página/tamanho/tema, 64 aprovadas nos critérios declarados. PNGs reais, especialmente móveis. Não equivale a certificação de acessibilidade/usabilidade. [Relatório de responsividade](RELATORIO_RESPONSIVIDADE.md).

## Ambiente e tecnologias utilizadas

win32 10.0.26200, x64; Node v24.19.0; CPU Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz; 12 processadores lógicos; 15.9 GiB RAM. PostgreSQL 16.16 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit. Chromium 159.0.8154.6; Playwright 1.65.1; socket.io-client e pg para integração. As versões detalhadas estão em evidencias/rodada_20261118_3/ambiente.json e evidencias/rodada_20261118_3/navegador.json. Sem mocks de serviços locais.

## Limitações e recomendações

Uma máquina e um Chromium headless; sem hardware móvel físico, Firefox/Safari, rede pública, SMTP real, TLS de implantação, DoS, força bruta, carga concorrente prolongada, backup/desastre ou certificação de acessibilidade. APIs externas de avatares/imagens/fontes foram bloqueadas. SQL Injection e XSS foram avaliados com payloads selecionados, não por prova de ausência em todos os caminhos. A confirmação de e-mail local valida a lógica, mas não comprova entrega numa caixa institucional real.

Manter os testes de autorização, validar entrega SMTP real antes de disponibilizar a aplicação, testar outros navegadores e infraestrutura de implantação. O build do frontend terminou com aviso de bundle acima de 500 kB; avaliar divisão de código e carregamento sob demanda, sem tratar esse aviso como falha de compilação. Se houver casos reprovados nesta rodada, analisar suas evidências antes de autorizar correções. Nenhuma correção foi executada nesta avaliação.

## Arquivos e reprodução

Documentos: RELATORIO_TESTES.md, CASOS_DE_TESTE.md, RESULTADOS_TESTES.csv, RELATORIO_SEGURANCA.md, RELATORIO_DESEMPENHO.md, RELATORIO_RESPONSIVIDADE.md e README_REPRODUCAO.md. Registros estruturados, logs e capturas em evidencias/rodada_20261118_3/. Lista completa em ARQUIVOS_CRIADOS.md e manifesto com SHA-256.

Veja [README_REPRODUCAO.md](README_REPRODUCAO.md) para comandos e salvaguardas. As senhas, os tokens e as configurações privadas não integram o pacote de entrega. Resultados consolidados: evidencias/rodada_20261118_3/resultados-consolidados.json.
