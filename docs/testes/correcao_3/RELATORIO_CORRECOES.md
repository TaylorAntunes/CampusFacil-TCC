# Correção dos três casos reprovados — CampusFácil

Data: 18/11/2026, America/Sao_Paulo. Alterações autorizadas pelo autor após a avaliação de 184 casos.

## Resultado

- CT175: **aprovado** — prestador consulta suas solicitações recebidas; cada solicitante recebe somente as próprias. A identidade vem do JWT, sem aceitar identidade injetada na consulta.
- CT176: **aprovado** — POST /notifications retorna 403; notificações de sistema são geradas internamente pelas ações autorizadas, e continuam sendo persistidas e entregues por Socket.IO.
- CT181: **aprovado** — nome é aparado e validado com 3 a 120 caracteres no perfil e no serviço, usando a mesma regra do cadastro. Omitir o nome em atualização parcial continua permitido.

**96 casos efetivamente executados; 96 aprovados; 0 reprovados.** São 75 casos de API/integração, os dez da ampliação anterior e onze regressões positivas/negativas adicionais. Não foi repetida a matriz de 64 viewports nesta correção localizada. O build do backend, que também executa tsc --noEmit, passou. Não se afirma que toda a auditoria de 184 casos foi reexecutada.

## Testes positivos e negativos adicionais

CT185–CT195 verificam: prestador acessando solicitações de duas pessoas; B/C acessando apenas as próprias; query de identidade ignorada; acesso sem JWT; anúncio inexistente; tentativas públicas de gerar avisos sem inserção no banco; aceite legítimo gerando evento real; nomes vazios, espaços, curtos, longos e numéricos rejeitados; nome válido normalizado; atualização parcial sem nome.

O caso CT064 foi adaptado para produzir a notificação por uma solicitação real autorizada em vez de chamar o endpoint público que agora é bloqueado. A entrega Socket.IO e a persistência continuam sendo verificadas. Não foi removida a checagem de entrega de notificações.

## Ambiente e limites

Somente PostgreSQL isolado, contas fictícias e backend real na porta 4433, sem mocks. Configuração e credenciais ficam em runtime/*.private.json e não integram o pacote público. Nenhuma migração, dado real ou tela do frontend foi alterado nesta correção. O modo local de confirmação de e-mail permanece como definido anteriormente; SMTP externo não foi testado. Esses testes não certificam segurança absoluta.

## Reprodução

Na pasta docs/testes/correcao_3, os scripts executados foram:

~~~powershell
node scripts/prepare.cjs
# em outro terminal: node scripts/start-backend.cjs
node scripts/api.cjs
node scripts/extended-review.cjs
node scripts/focus-three.cjs
~~~

Antes disso, copie o código corrigido do backend para runtime/backend e mantenha as dependências originais instaladas. prepare.cjs lê o .env apenas para criar um banco de teste próprio, nunca para executar os ensaios no banco original. O banco de teste foi preservado para inspeção. O build foi executado com npm.cmd run build no backend.

## Arquivos alterados

- `backend/src/services/fetch-advertisement-service-requests.ts`
- `backend/src/services/factories/make-fetch-advertisement-service-requests-service.ts`
- `backend/src/http/controllers/advertisements/fetch-advertisement-service-requests-controller.ts`
- `backend/src/http/controllers/service-requests/fetch-by-advertisement.ts`
- `backend/src/http/controllers/notifications/create.ts`
- `backend/src/utils/user-name-schema.ts`
- `backend/src/http/controllers/users/update-user-profile-controller.ts`
- `backend/src/http/controllers/users/register.ts`
- `backend/src/services/update-user-profile.ts`

Detalhes dos testes e respostas HTTP sanitizadas estão em evidencias/. A tabela completa está em RESULTADOS_RETESTES.csv. Versões anteriores dos oito arquivos existentes foram preservadas em antes/ somente no projeto local; o novo utilitário de nome não tinha versão anterior.
