# Casos de teste — CampusFácil

Execução consolidada: 18/11/2026, 03:02:58 (America/Sao_Paulo).

Não foi encontrado protocolo de testes prévio nem documentação Markdown de requisitos no código original pesquisado, excluindo dependências. IDs CT001–CT166 foram criados para esta avaliação. Os requisitos são derivados da solicitação do autor e dos fluxos observáveis; não constituem uma especificação previamente homologada.

Classificação: aprovado = todas as asserções do cenário satisfeitas; reprovado = comportamento divergente, inclusive erros 500 onde se esperava rejeição 4xx; bloqueado = impedimento que inviabiliza executar; não executado = procedimento não realizado. Erro interno não equivale a bypass.

Uma primeira tentativa de CT079 encontrou seletor ambíguo; houve reteste real com seletor de bolha de mensagem. Os oito casos da landing foram repetidos sem sessão, pois / autenticado exibe o painel. Evidências iniciais e retestes permanecem disponíveis; só o resultado do reteste é contabilizado. Nenhum resultado foi alterado por inspeção de código.

## CT001 — Cadastro institucional

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /users com e-mail @ifce.edu.br e senha gerada em memória
- Resultado esperado: HTTP 201; usuário persistido
- Resultado obtido: {"id":"c1e0b6e1-2492-4834-8878-53e04675dc5a","created":true}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT002 — Cadastro externo

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /users com domínio gmail.com
- Resultado esperado: HTTP 400 e nenhuma conta criada
- Resultado obtido: HTTP 400; sem inserção
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT003 — Cadastro duplicado

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Repetir o e-mail do prestador
- Resultado esperado: HTTP 409
- Resultado obtido: HTTP 409
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT004 — Dados inválidos no cadastro

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar nome numérico, e-mail malformado e senha curta
- Resultado esperado: HTTP 400/422, sem erro interno
- Resultado obtido: Esperada rejeição 4xx, recebido 500
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT005 — Nome vazio no cadastro

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /users com name vazio e e-mail institucional
- Resultado esperado: Rejeitar nome vazio
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT006 — Sufixos de domínio maliciosos

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Testar subdomínio e domínio concatenado
- Resultado esperado: Todos rejeitados
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT007 — Login correto

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Criar solicitante e terceiro, efetuar login real
- Resultado esperado: Token válido permite /me
- Resultado obtido: Duas contas adicionais; sessões válidas
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT008 — Senha incorreta

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /sessions com senha diferente
- Resultado esperado: HTTP 400 sem token
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT009 — Rotas protegidas sem token

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /me, /users/orders, /notifications/user e /dashboard/stats
- Resultado esperado: HTTP 401 em todas
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT010 — JWT inválido e expirado

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /me com token inválido e JWT de teste expirado assinado com a chave exclusiva do teste
- Resultado esperado: HTTP 401
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT011 — Hash bcrypt

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Consultar somente conta fictícia e comparar em memória sem exportar hash
- Resultado esperado: Senha diferente do hash; bcrypt.compare verdadeiro
- Resultado obtido: {"algorithm":"bcrypt","cost":6,"compare":true}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT012 — Titularidade do e-mail institucional

- Requisito/regra: Autenticação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Cadastrar endereço fictício sem caixa postal e tentar /me
- Resultado esperado: Conta não verificada não deveria acessar funções restritas à comunidade
- Resultado obtido: Conta acessa /me imediatamente sem confirmar posse do e-mail; filtro de domínio não comprova vínculo
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT013 — Visualização do próprio perfil

- Requisito/regra: Perfis.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /me
- Resultado esperado: HTTP 200 sem password_hash
- Resultado obtido: {"fields":["id","name","email","course","semester","bio","avatar_url","location","response_time","skills","role","created_at"]}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT014 — Atualização pessoal

- Requisito/regra: Perfis.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PUT /me com curso, semestre, bio e skills
- Resultado esperado: Dados persistidos e retornados
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT015 — Não alterar perfil alheio

- Requisito/regra: Perfis.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PUT /me com userId do terceiro e nome modificado
- Resultado esperado: Campo userId injetado não modifica terceiro
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT016 — Upload de avatar PNG

- Requisito/regra: Perfis.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar PNG mínimo via FormData e consultar arquivo servido
- Resultado esperado: HTTP 200; URL acessível; perfil atualizado
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT017 — Upload rejeita texto

- Requisito/regra: Perfis.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar text/plain como avatar
- Resultado esperado: HTTP 400
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT018 — Perfil público do prestador

- Requisito/regra: Perfis.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /sellers/:id sem autenticação
- Resultado esperado: HTTP 200 sem hash da senha
- Resultado obtido: {"publicFields":["id","name","email","course","semester","bio","avatar_url","location","response_time","skills","role","created_at"]}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT019 — Criação válida

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /advertisements com categoria existente
- Resultado esperado: HTTP 201 e registro persistido
- Resultado obtido: {"ad":"4f1f39f4-b142-482f-a4c0-fcddcbd13347"}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT020 — Listagem e palavra-chave

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /advertisements?q=
- Resultado esperado: Busca retorna anúncio esperado
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT021 — Filtro por categoria

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /advertisements?category=nome
- Resultado esperado: Todos os anúncios retornados pertencem à categoria
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT022 — Edição própria

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PUT /advertisements/:id
- Resultado esperado: HTTP 200 e valor persistido
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT023 — Campos ausentes

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /advertisements sem descrição/categoria
- Resultado esperado: HTTP 400
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT024 — Preço negativo

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST com price=-10
- Resultado esperado: HTTP 400/422
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT025 — Título e descrição vazios

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST com strings vazias
- Resultado esperado: HTTP 400/422
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT026 — Edição de terceiro

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PUT com sessão de terceiro
- Resultado esperado: HTTP 403 e título preservado
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT027 — Exclusão de terceiro

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: DELETE com sessão de terceiro
- Resultado esperado: HTTP 403; registro mantido
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT028 — Exclusão própria

- Requisito/regra: Anúncios.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Criar anúncio descartável e excluir pelo proprietário
- Resultado esperado: HTTP 204; registro removido
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT029 — Criar solicitação

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Solicitante chama POST /service-requests
- Resultado esperado: HTTP 201 e status PENDING
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT030 — Duplicação ativa

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Repetir POST para o mesmo serviço
- Resultado esperado: HTTP 400/409 sem segunda solicitação
- Resultado obtido: Esperada rejeição 4xx, recebido 500
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT031 — Terceiro altera status

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PATCH status ACCEPTED por terceiro
- Resultado esperado: HTTP 403
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT032 — Transição inválida

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Solicitante tenta PENDING→COMPLETED
- Resultado esperado: HTTP 400
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT033 — Aceitar solicitação

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Prestador aceita solicitação
- Resultado esperado: HTTP 200 e ACCEPTED
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT034 — Avaliar antes da conclusão

- Requisito/regra: Avaliações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Avaliar com solicitação ACCEPTED
- Resultado esperado: HTTP 400/403; sem avaliação
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT035 — Iniciar serviço

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Solicitante inicia após aceite
- Resultado esperado: HTTP 200 e IN_PROGRESS
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT036 — Concluir serviço

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Solicitante conclui serviço iniciado
- Resultado esperado: HTTP 200 e COMPLETED
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT037 — Avaliação após conclusão

- Requisito/regra: Avaliações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Remover apenas avaliação antecipada do próprio ensaio, se a falha a criou; avaliar após conclusão
- Resultado esperado: HTTP 201 e média consistente
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT038 — Avaliação duplicada

- Requisito/regra: Avaliações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Repetir avaliação do mesmo serviço e usuário
- Resultado esperado: HTTP 409/400, sem erro interno
- Resultado obtido: Esperada rejeição 4xx, recebido 500
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT039 — Serviço não contratado

- Requisito/regra: Avaliações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Terceiro sem contrato tenta avaliar
- Resultado esperado: HTTP 400/403
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT040 — Estrelas fora do intervalo

- Requisito/regra: Avaliações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /reviews com estrelas inválidas
- Resultado esperado: HTTP 400/422 para 0 e 6
- Resultado obtido: Esperada rejeição 4xx, recebido 500
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT041 — Estrelas fracionárias

- Requisito/regra: Avaliações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /reviews com rating=3.5
- Resultado esperado: HTTP 400/422
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT042 — Contratar próprio serviço

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Prestador solicita o próprio anúncio
- Resultado esperado: HTTP 400/403
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT043 — Recusar solicitação

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Criar outro anúncio e solicitação, prestador recusa
- Resultado esperado: PENDING→REJECTED permitido para prestador
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT044 — Cancelar solicitação

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Nova solicitação após recusa e cancelamento
- Resultado esperado: PENDING→CANCELLED pelo solicitante
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT045 — Acompanhamento

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /users/orders
- Resultado esperado: Solicitações pertencentes ao usuário retornadas
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT046 — Exclusão por terceiro (IDOR)

- Requisito/regra: Solicitações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Criar solicitação descartável e DELETE com terceiro
- Resultado esperado: HTTP 403; solicitação mantida
- Resultado obtido: Esperada rejeição 4xx, recebido 204
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT047 — Mensagem persistida

- Requisito/regra: Chat.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST /messages de A para B; GET thread em B
- Resultado esperado: HTTP 201; conteúdo no banco e histórico
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT048 — Mensagem para si mesmo

- Requisito/regra: Chat.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: POST recipientId igual ao autor
- Resultado esperado: HTTP 400
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT049 — Histórico de terceiros (HTTP)

- Requisito/regra: Chat.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /messages/A por C
- Resultado esperado: Terceiro não recebe conversa A↔B
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT050 — Mensagem em branco

- Requisito/regra: Chat.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar somente espaços
- Resultado esperado: HTTP 400/422 e sem persistência
- Resultado obtido: Esperada rejeição 4xx, recebido 201
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT051 — Remetente injetado

- Requisito/regra: Chat.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar senderId de C no corpo com sessão A
- Resultado esperado: Servidor usa identidade do JWT
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT052 — Entrega em tempo real

- Requisito/regra: Socket.IO.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Conectar B e C e enviar mensagem A→B por HTTP autenticado
- Resultado esperado: Evento recebido por B e persistido
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT053 — Isolamento entre salas legítimas

- Requisito/regra: Socket.IO.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Conectar C com sua identidade; monitorar evento por 400ms
- Resultado esperado: C não recebe mensagem A→B
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT054 — Conexão sem identidade

- Requisito/regra: Socket.IO.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Conectar sem auth e observar estado após 300ms
- Resultado esperado: Servidor desconecta sessão sem userId
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT055 — Assumir identidade sem JWT

- Requisito/regra: Socket.IO.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Conectar apenas com userId de B e enviar A→B
- Resultado esperado: Conexão com userId da vítima deve ser rejeitada e não receber evento
- Resultado obtido: Conexão sem token usando userId de B recebeu conteúdo privado

true !== false

- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT056 — JWT inválido com userId válido

- Requisito/regra: Socket.IO.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Conectar com userId B e token inválido
- Resultado esperado: Não entrar na sala privada
- Resultado obtido: Servidor aceitou userId válido mesmo com token inválido

true !== false

- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT057 — Reconexão e histórico

- Requisito/regra: Socket.IO.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Desconectar B, enviar offline, reconectar B e enviar online
- Resultado esperado: Reconexão recebe novos eventos; histórico inclui mensagem offline
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT058 — 100 entregas reais de mensagens

- Requisito/regra: Desempenho.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar sequencialmente 100 POSTs e medir performance.now de antes do HTTP até evento no cliente B no mesmo processo
- Resultado esperado: 100 eventos correlacionados recebidos; métricas gravadas
- Resultado obtido: {"sent":100,"received":100,"failures":0,"minMs":6.026299999999992,"maxMs":16.13209999999981,"meanMs":9.051842,"medianMs":8.698849999999993,"p95Ms":12.003399999999601,"method":"HTTP POST iniciado → evento new_message recebido; mesmo processo/relógio monotônico; serial; loopback; inclui HTTP, persistência PostgreSQL e Socket.IO; sem aquecimento excluído","timestamp":"2026-11-18T05:50:09.664Z"}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT059 — Recebimento interno

- Requisito/regra: Notificações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /notifications/user do prestador
- Resultado esperado: Listagem inclui solicitação criada
- Resultado obtido: {"count":6}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT060 — Marcar como lida

- Requisito/regra: Notificações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PATCH /notifications/:id/read pelo titular
- Resultado esperado: read=true no banco
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT061 — IDOR leitura de terceiro

- Requisito/regra: Notificações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Criar notificação fictícia para A e marcar com C
- Resultado esperado: HTTP 403 e read preservado
- Resultado obtido: Esperada rejeição 4xx, recebido 200
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT062 — Exclusão por terceiro

- Requisito/regra: Notificações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: DELETE notificação de A pela sessão C
- Resultado esperado: HTTP 403
- Resultado obtido: HTTP esperado 403; recebido 500: {"statusCode":500,"error":"Internal Server Error","message":"Not allowed."}

500 !== 403

- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT063 — Contagem e marcar todas

- Requisito/regra: Notificações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PATCH /notifications/read/all; conferir banco
- Resultado esperado: Sem notificações não lidas do usuário
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT064 — Criação e evento

- Requisito/regra: Notificações.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Conectar A; POST notificação fictícia para A
- Resultado esperado: HTTP 201 e evento new_notification real
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT065 — Consistência dos indicadores

- Requisito/regra: Painel.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET /dashboard/stats comparado com SELECTs no banco isolado
- Resultado esperado: Valores coincidem com agregações SQL independentes
- Resultado obtido: {"api":{"publishedAdvertisements":4,"activeServiceRequests":0,"unreadMessages":0,"rating":3,"monthlyEarnings":30,"monthlySpent":0,"contracts":1},"sql":{"ads":4,"active":0,"unread":0,"rating":3,"total":30}}
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT066 — SQL Injection em busca/login

- Requisito/regra: Segurança.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: GET busca e POST login com aspas e payload SQL
- Resultado esperado: Sem bypass; banco íntegro
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT067 — Ausência de hash em mensagens/perfil

- Requisito/regra: Segurança.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Consultar thread e seller
- Resultado esperado: Nenhuma resposta pública testada contém password_hash
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT068 — Mass assignment de role

- Requisito/regra: Segurança.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: PUT /me com role ADMIN e password_hash injetados
- Resultado esperado: Role permanece MEMBER
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT069 — Unicidade do e-mail

- Requisito/regra: Banco.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: INSERT direto em transação controlada com e-mail já existente
- Resultado esperado: SQLSTATE 23505; sem duplicação
- Resultado obtido: SQLSTATE 23505
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT070 — Integridade referencial

- Requisito/regra: Banco.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: INSERT direto com FK inválida
- Resultado esperado: SQLSTATE 23503 para anúncio com autor inexistente
- Resultado obtido: SQLSTATE 23503
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT071 — Campo obrigatório nulo

- Requisito/regra: Banco.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: INSERT users com nome NULL
- Resultado esperado: SQLSTATE 23502
- Resultado obtido: SQLSTATE 23502
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT072 — Persistência em conexão nova

- Requisito/regra: Banco.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Abrir cliente novo e consultar entidades criadas
- Resultado esperado: Mensagem e anúncio recuperados por outro cliente PostgreSQL
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT073 — Unicidade de avaliação

- Requisito/regra: Banco.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: INSERT review duplicado pelo par já avaliado
- Resultado esperado: SQLSTATE 23505 para par reviewer/anúncio
- Resultado obtido: SQLSTATE 23505
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **aprovado**.

## CT074 — Restrições de domínio na camada SQL

- Requisito/regra: Banco.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Inserir avaliação inválida em transação e sempre ROLLBACK
- Resultado esperado: Banco deve rejeitar rating=8 se regra também existir no schema
- Resultado obtido: Banco aceita rating=8; não há CHECK de faixa (API deve compensar).
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT075 — Hash exposto na resposta de upload

- Requisito/regra: Segurança.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Banco PostgreSQL exclusivo; backend real na porta 4333; contas fictícias do mesmo lote.
- Procedimento executado: Enviar PNG e inspecionar somente os nomes dos campos retornados
- Resultado esperado: Resposta de avatar não deve incluir hash da senha
- Resultado obtido: Resposta de upload inclui password_hash do usuário; valor omitido das evidências
- Evidência: evidencias/api-http.json; evidencias/api-resultados.json
- Classificação: **reprovado**.

## CT076 — Cadastro inválido pelo formulário

- Requisito/regra: Interface/autenticação.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Preencher cadastro com domínio externo e enviar
- Resultado esperado: Erros de domínio e sem criação da conta
- Resultado obtido: evidencias/capturas/CT076-cadastro-dominio.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT077 — Login correto no navegador

- Requisito/regra: Interface/autenticação.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Digitar credenciais fictícias e submeter formulário real
- Resultado esperado: Redireciona ao painel e mantém sessão ao recarregar
- Resultado obtido: evidencias/capturas/CT077-login-painel.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT078 — Histórico após recarregar

- Requisito/regra: Interface/chat.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Abrir conversa B↔A e recarregar
- Resultado esperado: Mensagens enviadas via API aparecem após reload
- Resultado obtido: evidencias/capturas/CT078-historico-chat.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT079 — Envio pela interface

- Requisito/regra: Envio e persistência de mensagens pela interface.
- Natureza: navegador real + serviços reais.
- Pré-condições: Sessão fictícia B; backend e banco isolados reais.
- Procedimento executado: Abrir conversa B→A; preencher textarea; Enter; localizar apenas bolha p.whitespace-pre-wrap; recarregar e conferir mensagem.
- Resultado esperado: Mensagem enviada, campo limpo e conteúdo persistente após reload
- Resultado obtido: Mensagem visível na bolha após envio e após reload; textarea vazio.
- Evidência: evidencias/capturas/CT079-envio-chat-reteste.png
- Classificação: **aprovado**.

Observação: Primeira tentativa usou seletor ambíguo (prévia da conversa e bolha); reteste executado com seletor específico, sem alterar aplicação.

## CT080 — Logout no navegador

- Requisito/regra: Interface/autenticação.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Abrir menu do usuário, Sair, tentar /dashboard
- Resultado esperado: Remove token e protege painel
- Resultado obtido: evidencias/capturas/CT080-logout.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT081 — XSS armazenado em título

- Requisito/regra: Interface/segurança.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Abrir anúncio cujo título contém img/onerror e verificar marcador JavaScript
- Resultado esperado: Payload exibido como texto; sem execução
- Resultado obtido: evidencias/capturas/CT081-xss-texto.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT082 — Abrir ajuda

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Clicar em Abrir ajuda
- Resultado esperado: Painel de perguntas visível
- Resultado obtido: evidencias/capturas/CT082-chatbot-aberto.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT083 — Pergunta: Como solicitar um serviço?

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Selecionar pergunta e usar Ver outras dúvidas
- Resultado esperado: Resposta correspondente exibida; retorno às perguntas funciona
- Resultado obtido: evidencias/capturas/CT083-chatbot-resposta.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT084 — Pergunta: Como criar um anúncio?

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Selecionar pergunta e usar Ver outras dúvidas
- Resultado esperado: Resposta correspondente exibida; retorno às perguntas funciona
- Resultado obtido: evidencias/capturas/CT084-chatbot-resposta.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT085 — Pergunta: Como funciona o sistema de mensagens?

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Selecionar pergunta e usar Ver outras dúvidas
- Resultado esperado: Resposta correspondente exibida; retorno às perguntas funciona
- Resultado obtido: evidencias/capturas/CT085-chatbot-resposta.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT086 — Pergunta: Como avaliar um serviço?

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Selecionar pergunta e usar Ver outras dúvidas
- Resultado esperado: Resposta correspondente exibida; retorno às perguntas funciona
- Resultado obtido: evidencias/capturas/CT086-chatbot-resposta.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT087 — Pergunta: Quem pode se cadastrar?

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Selecionar pergunta e usar Ver outras dúvidas
- Resultado esperado: Resposta correspondente exibida; retorno às perguntas funciona
- Resultado obtido: evidencias/capturas/CT087-chatbot-resposta.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT088 — Pergunta: Como combinar as condições do serviço?

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Selecionar pergunta e usar Ver outras dúvidas
- Resultado esperado: Resposta correspondente exibida; retorno às perguntas funciona
- Resultado obtido: evidencias/capturas/CT088-chatbot-resposta.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT089 — Fechar ajuda

- Requisito/regra: Chatbot.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Clicar Fechar
- Resultado esperado: Botão flutuante retorna
- Resultado obtido: "Asserções satisfeitas"
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT090 — Persistência do tema claro

- Requisito/regra: Temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Alternar tema usando botão e recarregar
- Resultado esperado: Classe light e fundo claro após reload
- Resultado obtido: evidencias/capturas/CT090-tema-claro.png
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT091 — Chatbot no tema claro

- Requisito/regra: Temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Abrir chatbot e medir cores computadas
- Resultado esperado: Fundo e texto com contraste; sem fundo escuro fixo
- Resultado obtido: {"text":"rgb(20, 28, 46)","header":"rgb(255, 255, 255)"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT092 — inicio 360x800 light

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":360,"width":360,"theme":"light","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT92-inicio-publico-360-light.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT093 — cadastro 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT093-cadastro-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT094 — login 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT094-login-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT095 — explorar 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT095-explorar-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT096 — prestador 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT096-prestador-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT097 — chat 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT097-chat-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT098 — painel 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT098-painel-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT099 — solicitacoes 360x800 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"light","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT099-solicitacoes-360-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT100 — inicio 360x800 dark

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":360,"width":360,"theme":"dark","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT100-inicio-publico-360-dark.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT101 — cadastro 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT101-cadastro-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT102 — login 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT102-login-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT103 — explorar 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT103-explorar-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT104 — prestador 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT104-prestador-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT105 — chat 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT105-chat-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT106 — painel 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT106-painel-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT107 — solicitacoes 360x800 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":360,"scrollWidth":360,"bodyWidth":360,"theme":"dark","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT107-solicitacoes-360-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT108 — inicio 390x844 light

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":390,"width":390,"theme":"light","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT108-inicio-publico-390-light.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT109 — cadastro 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT109-cadastro-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT110 — login 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT110-login-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT111 — explorar 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT111-explorar-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT112 — prestador 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT112-prestador-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT113 — chat 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT113-chat-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT114 — painel 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT114-painel-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT115 — solicitacoes 390x844 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"light","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT115-solicitacoes-390-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT116 — inicio 390x844 dark

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":390,"width":390,"theme":"dark","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT116-inicio-publico-390-dark.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT117 — cadastro 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT117-cadastro-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT118 — login 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT118-login-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT119 — explorar 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT119-explorar-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT120 — prestador 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT120-prestador-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT121 — chat 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT121-chat-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT122 — painel 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT122-painel-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT123 — solicitacoes 390x844 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":390,"scrollWidth":390,"bodyWidth":390,"theme":"dark","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT123-solicitacoes-390-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT124 — inicio 768x1024 light

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":768,"width":768,"theme":"light","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT124-inicio-publico-768-light.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT125 — cadastro 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT125-cadastro-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT126 — login 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT126-login-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT127 — explorar 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT127-explorar-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT128 — prestador 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT128-prestador-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT129 — chat 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT129-chat-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT130 — painel 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT130-painel-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT131 — solicitacoes 768x1024 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"light","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT131-solicitacoes-768-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT132 — inicio 768x1024 dark

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":768,"width":768,"theme":"dark","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT132-inicio-publico-768-dark.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT133 — cadastro 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT133-cadastro-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT134 — login 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT134-login-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT135 — explorar 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT135-explorar-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT136 — prestador 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT136-prestador-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT137 — chat 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT137-chat-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT138 — painel 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT138-painel-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT139 — solicitacoes 768x1024 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":768,"scrollWidth":768,"bodyWidth":768,"theme":"dark","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT139-solicitacoes-768-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT140 — inicio 1920x1080 light

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":1920,"width":1920,"theme":"light","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT140-inicio-publico-1920-light.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT141 — cadastro 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT141-cadastro-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT142 — login 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT142-login-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT143 — explorar 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT143-explorar-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT144 — prestador 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT144-prestador-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT145 — chat 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT145-chat-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT146 — painel 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT146-painel-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT147 — solicitacoes 1920x1080 light

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"light","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT147-solicitacoes-1920-light.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT148 — inicio 1920x1080 dark

- Requisito/regra: Página inicial pública nos quatro tamanhos e dois temas.
- Natureza: navegador real + serviços reais.
- Pré-condições: Contexto novo sem token; somente preferência de tema; recursos externos bloqueados.
- Procedimento executado: Abrir / sem autenticação, confirmar título institucional, medir largura e capturar página e chatbot.
- Resultado esperado: Landing pública, tema correto e sem rolagem horizontal
- Resultado obtido: {"viewport":1920,"width":1920,"theme":"dark","heading":"Encontre e ofereça serviços na comunidade acadêmica."}
- Evidência: evidencias/capturas/CT148-inicio-publico-1920-dark.png
- Classificação: **aprovado**.

Observação: Reteste sem sessão: / autenticado exibe o painel por regra da aplicação. O script principal foi ajustado para não autenticar páginas públicas.

## CT149 — cadastro 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Criar conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT149-cadastro-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT150 — login 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Entrar na sua conta","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT150-login-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT151 — explorar 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Explorar serviços","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT151-explorar-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT152 — prestador 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT152-prestador-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT153 — chat 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Participantes e mensagens","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT153-chat-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT154 — painel 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Prestador fictício atualizado","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT154-painel-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT155 — solicitacoes 1920x1080 dark

- Requisito/regra: Responsividade.
- Natureza: navegador real + serviços reais.
- Pré-condições: Chromium real headless; frontend/backend reais isolados; dados fictícios do lote API.
- Procedimento executado: Contexto com sessão fictícia pré-carregada (não é teste de login); abrir rota, aguardar renderização, medir layout e capturar PNG
- Resultado esperado: Sem rolagem horizontal; conteúdo principal visível; rota carregada e tema correto
- Resultado obtido: {"width":1920,"scrollWidth":1920,"bodyWidth":1920,"theme":"dark","heading":"Minhas solicitações","mainVisible":true,"overflow":[],"capture":"evidencias/capturas/CT155-solicitacoes-1920-dark.png"}
- Evidência: evidencias/ui-resultados.json; evidencias/capturas/
- Classificação: **aprovado**.

## CT156 — TypeScript frontend

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Executar compilador local --noEmit com tsconfig original, na cópia
- Resultado esperado: Processo termina com código 0
- Resultado obtido: exit=0
- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **aprovado**.

## CT157 — Build frontend

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Executar vite build na cópia isolada
- Resultado esperado: Build de produção termina com código 0
- Resultado obtido: exit=0; aviso de bundle grande registrado no log
- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **aprovado**.

## CT158 — TypeScript backend

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Executar tsc --noEmit com tsconfig original no backend, sem emissão de arquivos
- Resultado esperado: Processo termina com código 0
- Resultado obtido: TypeScript backend exit=2; consulte backend-typecheck.log

2 !== 0

- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **reprovado**.

## CT159 — Build backend

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Executar script de build definido no package.json, apenas na cópia isolada usando NODE_PATH
- Resultado esperado: Script npm run build termina com código 0
- Resultado obtido: Build backend exit=1; tsup não declarado/instalado

1 !== 0

- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **reprovado**.

## CT160 — Upload SVG com conteúdo ativo

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Enviar SVG como avatar de conta fictícia; navegar apenas no arquivo local isolado e verificar marcador JavaScript
- Resultado esperado: Arquivo ativo rejeitado ou servido de modo que script não execute
- Resultado obtido: Script SVG enviado como avatar executou no origin da API ao abrir o arquivo diretamente

true !== false

- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **reprovado**.

## CT161 — JWT anterior ao logout

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Após teste de logout no navegador, reutilizar a sessão fictícia anterior em GET /me
- Resultado esperado: Token anterior deveria ser invalidado quando houver revogação de sessão
- Resultado obtido: Token continua válido após logout local; não há revogação no servidor (sessão JWT stateless)

200 !== 401

- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **reprovado**.

## CT162 — Persistência dos totais após operações

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Contar tabelas em duas conexões PostgreSQL novas
- Resultado esperado: Mesmos totais em duas conexões independentes; relações existentes
- Resultado obtido: {"users":12,"advertisements":15,"requests":12,"reviews":9,"messages":326}
- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **aprovado**.

## CT163 — Exclusão em cascata no banco

- Requisito/regra: Segurança, banco e verificações de compilação.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Ambiente isolado de testes; contas fictícias.
- Procedimento executado: Criar anúncio, solicitação, order e review em transação; excluir anúncio; verificar filhos; ROLLBACK final
- Resultado esperado: Filhos de anúncio descartável removidos sem órfãos
- Resultado obtido: Solicitação, order e review removidos; transação revertida ao final
- Evidência: evidencias/adicionais.json; evidencias/*.log
- Classificação: **aprovado**.

## CT164 — Reconexão automática após queda de transporte

- Requisito/regra: Isolamento e autorização; recuperação após interrupção.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Instâncias e contas fictícias exclusivas; mensagens sem dados pessoais.
- Procedimento executado: Conectar com reconnection=true; fechar Engine.IO para simular queda do transporte; aguardar connect sem chamar connect manualmente; enviar mensagem
- Resultado esperado: Cliente se reconecta automaticamente e recebe nova mensagem
- Resultado obtido: Reconexão automática e entrega confirmadas; queda simulada no cliente, não desligamento de rede física
- Evidência: evidencias/socket-seguranca-eventos.json; evidencias/socket-seguranca.json
- Classificação: **aprovado**.

## CT165 — Sessão C não pode entrar na sala de B

- Requisito/regra: Isolamento e autorização; recuperação após interrupção.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Instâncias e contas fictícias exclusivas; mensagens sem dados pessoais.
- Procedimento executado: Conectar auth.userId=B e token=C; enviar A→B e observar vazamento
- Resultado esperado: JWT de C não autoriza sala B
- Resultado obtido: JWT de C com userId de B recebeu mensagem privada de A para B
- Evidência: evidencias/socket-seguranca-eventos.json; evidencias/socket-seguranca.json
- Classificação: **reprovado**.

## CT166 — Listagem pública não expõe hashes

- Requisito/regra: Isolamento e autorização; recuperação após interrupção.
- Natureza: execução automatizada com serviços reais ou ferramenta local; sem mocks.
- Pré-condições: Instâncias e contas fictícias exclusivas; mensagens sem dados pessoais.
- Procedimento executado: Consultar lista pública; registrar apenas nomes dos campos e quantidade, sem valores de hashes
- Resultado esperado: GET /sellers sem token deve omitir password_hash
- Resultado obtido: A lista pública de prestadores contém password_hash de contas fictícias
- Evidência: evidencias/socket-seguranca-eventos.json; evidencias/socket-seguranca.json
- Classificação: **reprovado**.
