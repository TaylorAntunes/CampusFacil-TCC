# Relatório de segurança — rodada atual

Testes realizados exclusivamente em ambiente local e banco isolado, com contas, mensagens e anúncios fictícios. Não houve exploração de terceiros, força bruta, DoS ou acesso a dados reais. Nenhuma correção de produção foi aplicada nesta rodada.

## Falhas reproduzidas

Nenhuma das falhas históricas CT175, CT176 e CT181 foi reproduzida nesta rodada. O endpoint de notificações recusou a criação pública, a consulta de solicitações respeitou a identidade autenticada e o perfil rejeitou nomes inválidos.



Evidência detalhada: [requisições da ampliação](evidencias/ampliacao-http.json) e [resultados](evidencias/ampliacao-resultados.json). Cada payload usa marca de auditoria e sujeitos do banco exclusivo. Não confundir as recomendações de correção com trabalho já realizado.

## Controles aprovados nos cenários executados

- Cadastro externo e sufixos maliciosos rejeitados; confirmação pendente bloqueia login. Uso único, expiração e reenvio do link foram testados pela caixa de saída local.
- JWT inválido/expirado rejeitado no HTTP; sessão encerrada por logout rejeitada; socket da sessão encerrada desconectado.
- bcrypt confirmado por comparação real, com custo medido 12; hashes e tokens de confirmação ausentes nas respostas públicas testadas.
- Edição/exclusão e alteração de disponibilidade de anúncio alheio rejeitadas; exclusão de solicitação e alteração de notificação por terceiro rejeitadas.
- Socket.IO rejeita ausência de JWT, JWT inválido e divergência entre identidade/token; salas legítimas isoladas; histórico HTTP não vazou conversa alheia.
- Avaliação antes da conclusão, sem contratação, duplicada, fracionária ou fora de faixa foi rejeitada; média comparada ao banco.
- Payloads SQL específicos na busca/login não produziram bypass nem destruição. Título com HTML foi exibido como texto no React. SVG ativo e SVG disfarçado de PNG foram rejeitados no upload.

Esses controles demonstram apenas o comportamento dos caminhos exercitados, não ausência geral de SQL Injection/XSS. Foram testados payloads e caminhos definidos, não todas as combinações possíveis.

## Inspeção estática separada dos testes

A arquitetura usa controllers, serviços e repositórios. JWT tem sessão persistida e verificação de titularidade. O frontend guarda accessToken no localStorage. Não foi encontrado middleware explícito de rate limit nos fluxos inspecionados; isso é observação de código, não teste de força bruta. O componente de gráficos contém dangerouslySetInnerHTML para estilos; não se inferiu XSS sem prova de entrada controlável. Não houve crédito de teste por essas observações.

## Limites e referências

A entrega externa SMTP não foi testada: a confirmação usou a caixa local autorizada. Não houve avaliação de TLS público, infraestrutura, navegador móvel físico ou auditoria completa de privacidade. Dados de perfis públicos incluem e-mail institucional; a política de exposição exige decisão do projeto e não foi presumida como consentimento.

- [Socket.IO — middlewares](https://socket.io/docs/v4/middlewares/): referência para autenticar/autorização no handshake.
- [OWASP — prevenção de IDOR](https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html): referência para controle de acesso por recurso.
- [PostgreSQL 16 — constraints](https://www.postgresql.org/docs/16/ddl-constraints.html): referência para unicidade, chaves estrangeiras e CHECK.

Essas referências embasam recomendações; os resultados vêm dos ensaios locais, não das referências.
