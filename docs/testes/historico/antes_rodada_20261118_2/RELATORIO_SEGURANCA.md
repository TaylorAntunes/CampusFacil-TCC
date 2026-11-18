# Relatório de segurança — CampusFácil

Execução exclusivamente local e controlada, em banco isolado, com contas e mensagens fictícias. Não houve varredura de terceiros ou tentativa de obter dados reais. Esta avaliação não é certificação de segurança nem auditoria exaustiva. Severidades são avaliação técnica qualitativa, sem pontuação CVSS calculada.

## S01 — Hashes de senha expostos publicamente

- Severidade: **Crítica**.
- Casos: CT166; CT075.
- Evidência observada: GET /api/sellers/ sem token retorna password_hash. POST /api/users/avatar também inclui o hash do próprio usuário. Valores foram ocultados das evidências.
- Impacto e limite: O endpoint público permite obter hashes para tentativa de quebra offline. O bcrypt está presente, mas o custo medido é 6 e não elimina o risco da exposição.
- Recomendação, ainda não aplicada: Serializar todas as respostas com campos explicitamente permitidos; nunca retornar password_hash. Avaliar política de custo do bcrypt e resposta a exposição antes de disponibilizar a aplicação.

## S02 — Impersonação e leitura de mensagens via Socket.IO

- Severidade: **Crítica**.
- Casos: CT055; CT056; CT165.
- Evidência observada: Conexão com userId de B sem JWT recebeu mensagem A→B. Token de C com userId de B também recebeu conteúdo privado.
- Impacto e limite: Confidencialidade do chat e isolamento de usuários comprometidos para quem obtém um ID existente.
- Recomendação, ainda não aplicada: Autenticar no middleware io.use; verificar assinatura/expiração do JWT e derivar a sala exclusivamente de sub validado; revalidar autorização.

## S03 — Exclusão de solicitação de terceiro (IDOR)

- Severidade: **Alta**.
- Casos: CT046.
- Evidência observada: DELETE /api/service-requests/:id autenticado como C retornou 204 para solicitação A↔B.
- Impacto e limite: Um usuário autenticado pode remover solicitação alheia conhecendo seu UUID.
- Recomendação, ainda não aplicada: Validar participante/autorização no serviço de exclusão antes de remover; acrescentar regressão de autorização.

## S04 — Leitura indevida de notificação (IDOR)

- Severidade: **Média**.
- Casos: CT061.
- Evidência observada: C marcou notificação de A como lida (HTTP 200); consulta independente confirmou read=true.
- Impacto e limite: Terceiro modifica o estado de notificações de outro usuário.
- Recomendação, ainda não aplicada: Vincular consulta e atualização a notificationId + recipientId do JWT.

## S05 — SVG ativo servido no origin da API

- Severidade: **Alta**.
- Casos: CT160.
- Evidência observada: SVG com script benigno foi aceito como avatar; navegação direta no arquivo executou window.__auditSvg=1.
- Impacto e limite: Conteúdo ativo pode ser hospedado no mesmo origin da API. A execução foi provada por marcador local; não se testou roubo de sessão.
- Recomendação, ainda não aplicada: Validar conteúdo e lista de formatos; reencodar imagens raster; rejeitar/sanitizar SVG; avaliar origin separado e cabeçalhos restritivos.

## S06 — Avaliações sem contratação/conclusão e estrelas fracionárias

- Severidade: **Média**.
- Casos: CT034; CT039; CT041.
- Evidência observada: Avaliações antes da conclusão e sem contratação retornaram 201. rating=3.5 foi aceito; valor persistido está no SQL de evidência.
- Impacto e limite: Média/reputação manipulável; regras acadêmicas do fluxo não são impostas no backend.
- Recomendação, ainda não aplicada: Exigir solicitação COMPLETED do avaliador; bloquear autoavaliação se essa for a regra; validar inteiro de 1 a 5.

## S07 — Vínculo institucional não confirmado

- Severidade: **Média**.
- Casos: CT012.
- Evidência observada: Cadastro fictício @ifce.edu.br consegue acessar /me imediatamente; não houve confirmação de posse do endereço.
- Impacto e limite: A restrição de domínio sozinha não comprova vínculo com a comunidade. Ausência de funcionalidade, não bypass do filtro de domínio.
- Recomendação, ainda não aplicada: Implementar confirmação de titularidade ou integração institucional antes de afirmar exclusividade efetiva da comunidade.

## S08 — Validações incompletas e erros internos

- Severidade: **Média**.
- Casos: CT004; CT005; CT024; CT025; CT030; CT038; CT040; CT050; CT062.
- Evidência observada: Nome vazio, preço negativo, anúncio vazio e mensagem de espaços foram aceitos. Duplicações e entradas inválidas causaram 500 em vários endpoints. Exclusão de notificação alheia foi impedida, mas retornou 500.
- Impacto e limite: Inconsistências de dados e tratamento de erro inadequado. Os testes de SQL Injection selecionados não produziram bypass nem destruição de tabelas.
- Recomendação, ainda não aplicada: Validar strings após trim, limites e inteiros; mapear erros de domínio/Prisma para 4xx e não expor detalhes internos.

## S09 — JWT válido após logout local

- Severidade: **Baixa / limitação de sessão**.
- Casos: CT080; CT161.
- Evidência observada: Logout limpa o armazenamento local e protege a interface, porém o token capturado antes do logout ainda acessa /me.
- Impacto e limite: Logout é local; token anteriormente obtido permanece utilizável até expirar. Classificação depende da política de sessão desejada.
- Recomendação, ainda não aplicada: Definir política de revogação/expiração e documentar o modelo stateless; não afirmar revogação imediata inexistente.

## S10 — Autocontratação e integridade de domínio

- Severidade: **Média**.
- Casos: CT042; CT074.
- Evidência observada: Prestador pode solicitar o próprio serviço; inserção SQL de rating=8 é aceita na transação de ensaio (revertida).
- Impacto e limite: Fluxos incoerentes e ausência de CHECK para faixa no banco. O teste SQL direto não representa um endpoint acessível ao usuário.
- Recomendação, ainda não aplicada: Bloquear autocontratação no serviço; avaliar CHECKs de preço/faixa no banco como defesa adicional, sem substituir validação de API.

## Controles que passaram nos cenários executados

JWT inválido/expirado foi rejeitado no HTTP; senha incorreta não autenticou; bcrypt comparou corretamente; edição/exclusão de anúncio alheio foi bloqueada; transição de solicitação por terceiro foi bloqueada; histórico HTTP de chat não vazou conversa alheia; SQL Injection nos payloads selecionados não produziu bypass; título com HTML foi tratado como texto no React. Esses resultados não invalidam as vulnerabilidades de outros caminhos.

## Inspeção estática, sem crédito de teste executado

- server.ts usa socket.handshake.auth.userId e consulta existência do usuário, sem autenticação JWT no Socket.IO.
- auth.service.ts mantém accessToken no localStorage; o logout apenas o remove.
- Não foi encontrada confirmação de e-mail no schema/rotas inspecionados.
- Não foi observado middleware de rate limit ou configuração explícita de CSP no código inspecionado. Não foi executado ataque de força bruta, DoS ou verificação de infraestrutura pública.
- Perfis públicos expõem e-mail institucional e outros campos do perfil. A adequação dessa visibilidade exige decisão de privacidade; não se presumiu consentimento ou ilegalidade.

## Evidências e reprodução

Executar scripts/api.cjs, scripts/additional.cjs e scripts/socket-security.cjs na instância isolada. Respostas HTTP sanitizadas: evidencias/api-http.json. Provas de sala: evidencias/socket-seguranca-eventos.json. Provas SQL: evidencias/seguranca-provas-sql.json. Captura do SVG: evidencias/capturas/CT160-svg-ativo.png. Não incluir runtime/*.private.json em publicações.

## Referências técnicas

- Socket.IO: [Middleware de autenticação/autorização](https://socket.io/docs/v4/middlewares/).
- OWASP: [Prevenção de IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html).
- PostgreSQL 16: [Constraints](https://www.postgresql.org/docs/16/ddl-constraints.html).

Referências consultadas em 18/11/2026. Apoiam as recomendações, não substituem as evidências locais.
