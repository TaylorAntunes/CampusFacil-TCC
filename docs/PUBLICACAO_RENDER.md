# Publicação para demonstração no Render

Esta configuração conserva o frontend React/Vite, o backend Fastify/Socket.IO e o PostgreSQL. Não copie o `.env`, a caixa de e-mails local ou o banco de desenvolvimento para o GitHub.

## Recursos

O `render.yaml` define uma API no plano Free, um site estático e um PostgreSQL Free, todos na região Oregon. Também é possível criar os três recursos manualmente com os mesmos comandos e variáveis.

1. Crie o PostgreSQL e utilize sua URL interna no `DATABASE_URL` da API. Restrinja o acesso externo do banco.
2. Crie a API a partir deste repositório, pasta `backend`, plano Free. Build: `npm ci --include=dev && npx prisma generate && npm run build`. Inicialização: `npx prisma migrate deploy && npm run prisma:seed && npm start`. Health check: `/api/categories`.
3. Configure `NODE_VERSION=22`, `NODE_ENV=production`, `HOST=0.0.0.0`, `JWT_SECRET` aleatório e privado, `DATABASE_URL`, `CORS_ORIGIN` e o SMTP no painel. O Render fornece `PORT` automaticamente.
4. Crie um Static Site a partir do repositório. Build, a partir da raiz: `cd frontend && npm ci --include=dev && npm run typecheck && npm run build`. Diretório publicado: `frontend/dist`. Configure `NODE_VERSION=22` e `VITE_API_URL=https://URL-REAL-DA-API/api` antes do build.
5. Adicione uma regra Rewrite de `/*` para `/index.html` no site estático. Configure `CORS_ORIGIN=https://URL-REAL-DO-FRONTEND` na API e faça novo deploy.
6. Confira as URLs efetivamente atribuídas pelo Render; os nomes podem receber sufixos. Não deixe URLs de exemplo ou localhost no ambiente publicado.

O seed inicial de categorias pode ser repetido: ele preserva categorias existentes e não cria usuários, anúncios, avaliações ou mensagens. Nenhuma conta local é enviada para a hospedagem.

## Confirmação de e-mail

Use `EMAIL_DELIVERY=smtp`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM`. As credenciais são inseridas somente no painel privado do serviço. O remetente precisa ser autorizado pelo provedor. Não utilize um remetente `@ifce.edu.br` sem autorização institucional.

O Render Free bloqueia as portas 25, 465 e 587. Um provedor compatível com a porta 2525, como o Brevo, é uma alternativa a testar. Na porta 2525, `SMTP_SECURE=false` permite negociar STARTTLS. A entrega ao destinatário deve ser validada com um e-mail institucional real antes de considerar o cadastro operacional. O modo de caixa local continua proibido em produção.

## Limites da demonstração

- O PostgreSQL gratuito expira em 30 dias e não inclui backups gerenciados. Exporte os dados que quiser preservar antes do prazo.
- A API pode suspender após 15 minutos sem tráfego e demorar para responder ao primeiro acesso.
- Os uploads locais desaparecem em reinícios e novos deploys. Esta configuração não oferece persistência das imagens enviadas.
- Os serviços gratuitos têm limites de uso. Não habilite upgrades ou recursos pagos sem avaliar os custos.

## Verificação após publicar

Valide `/api/categories`, a página inicial, o acesso direto a uma rota do frontend, cadastro `@ifce.edu.br`, recebimento e confirmação de e-mail, login, criação de anúncio e chat entre duas contas próprias. Confira temas claro/escuro e URLs HTTPS das imagens e do Socket.IO. Falhas de envio de e-mail impedem considerar o cadastro concluído.

Fontes consultadas em 18/11/2026: [Render Free](https://render.com/docs/free), [Web Services](https://render.com/docs/web-services), [Blueprint](https://render.com/docs/blueprint-spec), [SMTP Brevo](https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP).
