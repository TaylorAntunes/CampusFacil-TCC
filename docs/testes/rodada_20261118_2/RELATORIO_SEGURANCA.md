# Relatório de segurança — rodada atual

Testes realizados exclusivamente em ambiente local e banco isolado, com contas, mensagens e anúncios fictícios. Não houve exploração de terceiros, força bruta, DoS ou acesso a dados reais. Nenhuma correção de produção foi aplicada nesta rodada.

## Falhas reproduzidas

### S01 — Leitura de solicitações alheias pelo identificador público do anúncio

- Caso: **CT175**. Severidade qualitativa: **Alta**, sem cálculo CVSS.
- Prova executada: Um terceiro autenticado recebeu HTTP 200 em GET /api/advertisements/:id/service-requests, com a solicitação de outro usuário, requesterId e mensagem.
- Confirmação por inspeção: O controller envia somente advertisementId ao serviço. A consulta não aplica o ator autenticado como filtro nem verifica se ele é o prestador.
- Impacto e limite: Exposição das necessidades e mensagens de solicitações de outros participantes. Não houve acesso a dados reais: todos os sujeitos eram fictícios.
- Recomendação, não implementada nesta avaliação: Autorizar o prestador para consultar solicitações recebidas e limitar o solicitante aos próprios registros; testar explicitamente leitura por terceiro.

### S02 — Usuário comum pode criar aviso de sistema para outro participante

- Caso: **CT176**. Severidade qualitativa: **Média**, sem cálculo CVSS.
- Prova executada: POST /api/notifications, chamado por C para A com type=service_request_accepted, retornou 201 sem qualquer aceite de solicitação.
- Confirmação por inspeção: O endpoint aceita recipientId, type e message diretamente do usuário, sem autorização para representar eventos de sistema.
- Impacto e limite: Permite falsificar avisos internos. O ensaio não alterou o status da solicitação; demonstrou criação indevida do aviso, não execução real de contratação.
- Recomendação, não implementada nesta avaliação: Gerar avisos de sistema exclusivamente nos serviços que executam os eventos autorizados ou restringir severamente o endpoint público.

### S03 — Atualização do perfil aceita nome vazio

- Caso: **CT181**. Severidade qualitativa: **Baixa / qualidade dos dados**, sem cálculo CVSS.
- Prova executada: PUT /api/me com name vazio retornou 200. O nome fictício foi restaurado ao final do ensaio.
- Confirmação por inspeção: O campo é opcional, porém sem trim/min quando informado no schema de atualização.
- Impacto e limite: Inconsistência de identidade visual e qualidade do cadastro; não foi demonstrada elevação de privilégio.
- Recomendação, não implementada nesta avaliação: Aplicar no perfil a mesma validação de nome exigida no cadastro; distinguir omissão do campo de valor vazio.


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

- [Socket.IO — middlewares](https://socket.io/docs/v4/middlewares/): referência para autenticar/autorização no handshake.
- [OWASP — prevenção de IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html): referência para controle de acesso por recurso.
- [PostgreSQL 16 — constraints](https://www.postgresql.org/docs/16/ddl-constraints.html): referência para unicidade, chaves estrangeiras e CHECK.

Essas referências embasam recomendações; os resultados vêm dos ensaios locais, não das referências.
