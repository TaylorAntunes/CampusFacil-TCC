# Avaliação técnica do CampusFácil

Consolidado em 18/11/2026, 03:02:58, America/Sao_Paulo. Ensaios realizados em 18/11/2026. Projeto: C:\Users\taylor\Desktop\CampusFacil.

## Conclusão

Os fluxos principais funcionam nos cenários aprovados, porém foram reproduzidas vulnerabilidades críticas de confidencialidade/autorização e falhas de validação. **Não se recomenda tratar o sistema como seguro ou pronto para disponibilização com dados reais antes de corrigir e repetir os testes de segurança.** Nenhuma correção no código de produção foi aplicada nesta avaliação.

## Resumo verificável

| Indicador | Quantidade |
|---|---:|
| Planejados | 166 |
| Executados | 166 |
| Aprovados | 140 |
| Reprovados | 26 |
| Bloqueados | 0 |
| Não executados | 0 |
| Aprovação entre executados | 84.34% |

Fórmula: aprovados ÷ (aprovados + reprovados) × 100. Uma falha pode reprovar mais de um caso; número de casos reprovados não é número de vulnerabilidades distintas. Retestes substituem a classificação do mesmo ID e não aumentam o total. Não foi usado percentual de cobertura de linhas; ele não foi medido.

## Análise inicial e arquitetura

- Frontend React + TypeScript, Vite e Tailwind, Framer Motion, React Router, next-themes. Rotas para entrada, cadastro, exploração, detalhe do serviço, prestadores, solicitações, conversas e painel.
- Backend Fastify com controllers, services, repositories Prisma e repositories in-memory. Não havia suíte automatizada de produção configurada: o script test é placeholder.
- PostgreSQL acessado via Prisma 7 e adapter-pg; 16 migrações. Entidades: User, Advertisement, Category, ServiceRequest, Order, Review, Notification e Message. Relações, unicidade e exclusão em cascata foram ensaiadas com banco real.
- Autenticação HTTP JWT; senhas bcrypt. Custo medido: 6. Cookies e armazenamento local inspecionados; logout de interface e reutilização de token testados separadamente.
- Socket.IO recebe userId no handshake, consulta existência da conta e associa sala. As provas dinâmicas confirmaram ausência de vínculo seguro com a identidade JWT.
- Chatbot é uma lista de perguntas/respostas pré-definidas, não um modelo de IA generativa. Abertura, seleção das seis perguntas, retorno e fechamento executados.
- Regras observadas no serviço: prestador aceita/recusa PENDING; solicitante cancela PENDING, inicia ACCEPTED, conclui/cancela IN_PROGRESS. Tentativas inválidas e de terceiro foram executadas.
- Há filtros de domínio no cadastro; confirmação da posse do endereço não foi encontrada e conta fictícia obteve sessão sem confirmação.
- Não foi localizada documentação prévia de requisitos/protocolo de testes no projeto original pesquisado, fora de dependências. A lista de requisitos desta avaliação veio da solicitação do autor.

Inventário de arquivos e hashes: evidencias/source-before.json, source-after.json e integridade-fontes.json. Foram comparados 272 arquivos; mudanças detectadas em arquivos originais: **0**. Exclusões: dependências, build, uploads, .git e .env.

## Ambiente e isolamento

- Windows 10.0.26200 x64; Node v24.19.0; CPU Intel(R) Core(TM) i5-10400F CPU @ 2.90GHz; 15.9 GiB de RAM.
- Versões reais: fastify 5.6.1; @prisma/client 7.6.0; bcryptjs 3.0.2; socket.io 4.8.1; pg 8.20.0; zod 4.1.11.
- PostgreSQL: PostgreSQL 16.16 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit.
- Chromium 159.0.8154.6; Playwright 1.65.1.
- Banco exclusivo: **campusfacil_audit_20261118054512**. Cópias dos fontes em docs/testes/runtime; portas 4333/5174.
- Biblioteca Prisma gerada e dependências do backend original foram reutilizadas, mas conexão e JWT_SECRET foram substituídos por configuração exclusiva do teste. Uploads de teste foram gravados somente em runtime/backend/uploads.
- Contas, solicitações, mensagens e avaliações são fictícias. As contas e dados de demonstração anteriores do banco original não foram usados como sujeitos dos testes. A consulta final ao banco original foi somente leitura e não é uma comparação antes/depois.
- Testes reais HTTP, PostgreSQL, Socket.IO e navegador; **sem mocks de serviços**. JWT expirado foi criado com chave exclusiva de teste; sessão pré-carregada da matriz não conta como login executado.

## Principais resultados

Autenticação válida/inválida, bcrypt, perfil, CRUD de anúncios, transições autorizadas, persistência do chat, reconexão, notificações, banco e painel possuem evidências individuais. Frontend passa em TypeScript/build; backend reprova TypeScript e o script de build não encontra tsup. O desenvolvimento usa transpile-only e pode funcionar mesmo com erros de tipos.

### Casos reprovados

| ID | Cenário | Resultado |
|---|---|---|
| CT004 | Dados inválidos no cadastro | reprovado |
| CT005 | Nome vazio no cadastro | reprovado |
| CT012 | Titularidade do e-mail institucional | reprovado |
| CT024 | Preço negativo | reprovado |
| CT025 | Título e descrição vazios | reprovado |
| CT030 | Duplicação ativa | reprovado |
| CT034 | Avaliar antes da conclusão | reprovado |
| CT038 | Avaliação duplicada | reprovado |
| CT039 | Serviço não contratado | reprovado |
| CT040 | Estrelas fora do intervalo | reprovado |
| CT041 | Estrelas fracionárias | reprovado |
| CT042 | Contratar próprio serviço | reprovado |
| CT046 | Exclusão por terceiro (IDOR) | reprovado |
| CT050 | Mensagem em branco | reprovado |
| CT055 | Assumir identidade sem JWT | reprovado |
| CT056 | JWT inválido com userId válido | reprovado |
| CT061 | IDOR leitura de terceiro | reprovado |
| CT062 | Exclusão por terceiro | reprovado |
| CT074 | Restrições de domínio na camada SQL | reprovado |
| CT075 | Hash exposto na resposta de upload | reprovado |
| CT158 | TypeScript backend | reprovado |
| CT159 | Build backend | reprovado |
| CT160 | Upload SVG com conteúdo ativo | reprovado |
| CT161 | JWT anterior ao logout | reprovado |
| CT165 | Sessão C não pode entrar na sala de B | reprovado |
| CT166 | Listagem pública não expõe hashes | reprovado |

Detalhes de segurança, severidades e reprodução: [RELATORIO_SEGURANCA.md](RELATORIO_SEGURANCA.md). Não confundir rejeição por erro 500 com acesso indevido bem-sucedido; o relatório diferencia esses resultados.

### Desempenho

100 enviadas; 100 recebidas; 0 falhas. Mínima 6.026 ms; máxima 16.132 ms; média 9.052 ms; mediana 8.699 ms; P95 12.003 ms. Ensaio serial loopback sem SLA pré-definido; aprovação do caso significa 100 entregas e métricas registradas, não cumprimento de meta de latência. Veja [RELATORIO_DESEMPENHO.md](RELATORIO_DESEMPENHO.md).

### Responsividade

64 combinações verificadas, com capturas reais; critério automatizado sem overflow horizontal e conteúdo/tema presentes. Veja limites de geometria, recursos externos e inspeção visual no [RELATORIO_RESPONSIVIDADE.md](RELATORIO_RESPONSIVIDADE.md).

## Recomendações por prioridade

1. Remover hashes das respostas públicas e de upload; autenticar Socket.IO antes de ingressar em salas.
2. Aplicar autorização por titularidade na exclusão de solicitações e atualização de notificações; restringir formatos de avatar e conteúdo ativo.
3. Validar contratação/conclusão antes de avaliações, bloquear autocontratação e reforçar validação/erros 4xx.
4. Definir e implementar confirmação de e-mail institucional e política de sessão/logout conforme requisitos do TCC.
5. Corrigir erros TypeScript, declarar ferramenta de build e instituir a suíte de regressão; somente depois repetir avaliação.

Referências de recomendações e limites constam no relatório de segurança. Nenhuma das correções foi aplicada.

## Limitações

Uma máquina, um PostgreSQL local e um Chromium; não houve teste em hardware móvel real, Safari/Firefox, rede externa, TLS público, concorrência em larga escala, recuperação de desastre, backup, entrega real de e-mail, carga prolongada, força bruta, DoS ou certificação de acessibilidade. Não há comprovação de ausência geral de SQL Injection/XSS: foram testados payloads específicos, e SVG ativo foi confirmado por caminho distinto do título escapado. Cobertura planejada é de cenários, não exaustão de combinações de entrada. Não se mediu cobertura de código.

## Reprodução e arquivos

Siga [README_REPRODUCAO.md](README_REPRODUCAO.md). Casos completos em [CASOS_DE_TESTE.md](CASOS_DE_TESTE.md); planilha tabular em [RESULTADOS_TESTES.csv](RESULTADOS_TESTES.csv); dados consolidados em evidencias/resultados-consolidados.json.

Todos os arquivos publicáveis criados nesta avaliação são relacionados em [ARQUIVOS_CRIADOS.md](ARQUIVOS_CRIADOS.md), com hashes em evidencias/manifesto-publicavel.json. runtime/*.private.json contém configuração/credenciais apenas locais e foi excluído do pacote de entrega. Não publicar runtime, node_modules ou segredos.
