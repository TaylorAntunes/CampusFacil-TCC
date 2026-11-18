# Correções e retestes — CampusFácil

Execução: 18/11/2026, America/Sao_Paulo. Correções autorizadas pelo autor após a avaliação inicial. A avaliação original foi preservada em docs/testes e no pacote CampusFacil-avaliacao-inicial.zip.

## Resultado

- Casos reprovados originalmente: **26**.
- Desses, aprovados após correção: **26**.
- Total executado na nova rodada: **174** (26 regressões originalmente falhas, os demais casos originais e 8 casos adicionais).
- Aprovados: **174**; reprovados: **0**; bloqueados: **0**.
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

| ID | Cenário | Antes | Reteste |
|---|---|---|---|
| CT004 | Dados inválidos no cadastro | reprovado | aprovado |
| CT005 | Nome vazio no cadastro | reprovado | aprovado |
| CT012 | Titularidade do e-mail institucional | reprovado | aprovado |
| CT024 | Preço negativo | reprovado | aprovado |
| CT025 | Título e descrição vazios | reprovado | aprovado |
| CT030 | Duplicação ativa | reprovado | aprovado |
| CT034 | Avaliar antes da conclusão | reprovado | aprovado |
| CT038 | Avaliação duplicada | reprovado | aprovado |
| CT039 | Serviço não contratado | reprovado | aprovado |
| CT040 | Estrelas fora do intervalo | reprovado | aprovado |
| CT041 | Estrelas fracionárias | reprovado | aprovado |
| CT042 | Contratar próprio serviço | reprovado | aprovado |
| CT046 | Exclusão por terceiro (IDOR) | reprovado | aprovado |
| CT050 | Mensagem em branco | reprovado | aprovado |
| CT055 | Assumir identidade sem JWT | reprovado | aprovado |
| CT056 | JWT inválido com userId válido | reprovado | aprovado |
| CT061 | IDOR leitura de terceiro | reprovado | aprovado |
| CT062 | Exclusão por terceiro | reprovado | aprovado |
| CT074 | Restrições de domínio na camada SQL | reprovado | aprovado |
| CT075 | Hash exposto na resposta de upload | reprovado | aprovado |
| CT158 | TypeScript backend | reprovado | aprovado |
| CT159 | Build backend | reprovado | aprovado |
| CT160 | Upload SVG com conteúdo ativo | reprovado | aprovado |
| CT161 | JWT anterior ao logout | reprovado | aprovado |
| CT165 | Sessão C não pode entrar na sala de B | reprovado | aprovado |
| CT166 | Listagem pública não expõe hashes | reprovado | aprovado |

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

Outro PostgreSQL isolado: campusfacil_audit_20261118061152. Backend 4433; frontend 5274; Chromium real, HTTP, PostgreSQL e Socket.IO reais. Sem mocks de serviço. Recursos externos bloqueados nas capturas, como na rodada inicial. Banco do projeto recebeu a migração não destrutiva após os ensaios iniciais de correção; dados reais não foram usados nos ataques/ensaios.

Scripts executados em correcao/scripts: api.cjs, ui.cjs, additional.cjs, socket-security.cjs, verification-tests.cjs, retest-logout.cjs e build-smoke.cjs. Instâncias isoladas e credenciais ficam no runtime privado. Os scripts correspondem às novas regras descritas acima. Logs completos e respostas sanitizadas ficam em correcao/evidencias.

Para repetir a correção, use a mesma preparação isolada da avaliação inicial, com o código corrigido e portas 4433/5274; execute esses scripts na ordem listada. Copie dependências/lockfiles e rode prisma generate também no backend isolado antes de compilar essa cópia. O arquivo correcao/scripts/prepare.cjs cria o banco de teste; não use uma URL de produção.

Resultados tabulares: [RESULTADOS_RETESTES.csv](correcao/RESULTADOS_RETESTES.csv) e [COMPARATIVO_26.csv](correcao/COMPARATIVO_26.csv). Dados estruturados: correcao/evidencias/resultados-consolidados.json. Lista dos arquivos alterados: correcao/evidencias/arquivos-alterados.json.

## Arquivos alterados (55)

- modificado: `backend/.gitignore`
- criado: `backend/EMAIL_LOCAL.md`
- modificado: `backend/package-lock.json`
- modificado: `backend/package.json`
- criado: `backend/prisma/migrations/20261118090000_security_sessions_and_constraints/migration.sql`
- modificado: `backend/prisma/schema.prisma`
- criado: `backend/scripts/build.cjs`
- modificado: `backend/src/@types/fastify-jwt.d.ts`
- modificado: `backend/src/http/controllers/advertisements/create.ts`
- modificado: `backend/src/http/controllers/advertisements/search.ts`
- modificado: `backend/src/http/controllers/advertisements/update.ts`
- modificado: `backend/src/http/controllers/messages/send-message.ts`
- modificado: `backend/src/http/controllers/notifications/mark-as-read.ts`
- modificado: `backend/src/http/controllers/reviews/create.ts`
- modificado: `backend/src/http/controllers/sellers/get-sellers-controller.ts`
- modificado: `backend/src/http/controllers/service-requests/create-generic-request.ts`
- modificado: `backend/src/http/controllers/service-requests/create.ts`
- modificado: `backend/src/http/controllers/service-requests/delete-controller.ts`
- modificado: `backend/src/http/controllers/service-requests/fetch-by-user.ts`
- modificado: `backend/src/http/controllers/service-requests/update-status.ts`
- modificado: `backend/src/http/controllers/users/authenticate.ts`
- criado: `backend/src/http/controllers/users/email-verification.ts`
- criado: `backend/src/http/controllers/users/logout.ts`
- modificado: `backend/src/http/controllers/users/register.ts`
- modificado: `backend/src/http/controllers/users/routes.ts`
- modificado: `backend/src/http/controllers/users/upload-avatar-controller.ts`
- modificado: `backend/src/http/middlewares/verify-jwt.ts`
- modificado: `backend/src/repositories/in-memory/in-memory-advertisements-repository.ts`
- modificado: `backend/src/repositories/in-memory/in-memory-notifications-repository.ts`
- modificado: `backend/src/repositories/in-memory/in-memory-service-requests-repository.ts`
- modificado: `backend/src/repositories/prisma/prisma-advertisements-repository.ts`
- modificado: `backend/src/repositories/prisma/prisma-recent-activity-repository.ts`
- modificado: `backend/src/server.ts`
- modificado: `backend/src/services/create-service-request.ts`
- modificado: `backend/src/services/delete-service-request.ts`
- criado: `backend/src/services/email-verification.ts`
- criado: `backend/src/services/errors/http-error.ts`
- modificado: `backend/src/services/errors/service-already-requested-error.ts`
- modificado: `backend/src/services/factories/make-create-service-request-service.ts`
- modificado: `backend/src/services/factories/make-delete-service-request-service.ts`
- modificado: `backend/src/services/mark-notification-as-read.ts`
- modificado: `backend/src/services/register.ts`
- criado: `backend/src/services/session.ts`
- criado: `backend/src/utils/safe-image.ts`
- modificado: `backend/src/utils/serialize-user-profile.ts`
- modificado: `backend/src/utils/upload-advertisement-image.ts`
- modificado: `frontend/src/App.tsx`
- modificado: `frontend/src/components/Navbar.tsx`
- modificado: `frontend/src/contexts/AuthContext.tsx`
- modificado: `frontend/src/lib/socket-client.d.ts`
- modificado: `frontend/src/pages/ConversationsPage.tsx`
- modificado: `frontend/src/pages/LoginPage.tsx`
- modificado: `frontend/src/pages/RegisterPage.tsx`
- criado: `frontend/src/pages/VerifyEmailPage.tsx`
- modificado: `frontend/src/services/auth.service.ts`

## Limites que permanecem

Sem SMTP real configurado, a entrega institucional externa ainda não foi testada. Não houve teste em Internet, ataque de carga/DoS, hardware móvel físico ou certificação de acessibilidade. O teste de 100 mensagens é local e serial. Não se afirma segurança absoluta nem prontidão de produção baseada apenas nesta rodada. Configuração SMTP e revisão de implantação devem anteceder uso público.
