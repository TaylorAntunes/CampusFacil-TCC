# CampusFácil

Plataforma de serviços internos da comunidade acadêmica do IFCE, desenvolvida como projeto de TCC. Permite divulgar habilidades, consultar serviços, acompanhar solicitações, trocar mensagens e registrar avaliações.

O cadastro exige endereço com domínio exato @ifce.edu.br e confirmação de e-mail. Em desenvolvimento, os links de confirmação são gravados em uma caixa de saída local; isso não representa entrega em uma caixa institucional real.

## Tecnologias

- Frontend: React, TypeScript, Vite, Tailwind CSS e Framer Motion.
- Backend: Fastify, TypeScript, Prisma ORM e PostgreSQL.
- Autenticação: JWT, sessões persistidas e bcrypt.
- Comunicação em tempo real: Socket.IO.
- Temas claro e escuro.

## Requisitos

Node.js 24 e npm, Docker com Docker Compose (ou PostgreSQL local equivalente). VS Code/Cursor é opcional.

## Executar localmente

### Backend

Copie backend/.env.example para backend/.env. Defina uma senha local para o banco, atualize DATABASE_URL com os mesmos dados e gere um segredo aleatório para JWT_SECRET. Nunca publique o arquivo .env.

~~~powershell
cd backend
npm.cmd ci
Copy-Item .env.example .env
# Edite .env antes dos próximos comandos.
docker compose up -d
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npm.cmd run prisma:seed
npm.cmd run dev
~~~

O seed carrega as categorias iniciais e preserva as já existentes, podendo ser repetido sem duplicá-las. A API usa a porta 3333.

Para criar um segredo aleatório, por exemplo:

~~~powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
~~~

### Frontend

Em outro terminal:

~~~powershell
cd frontend
npm.cmd ci
Copy-Item .env.example .env
npm.cmd run dev
~~~

Acesse http://localhost:5173. O frontend usa a API em http://localhost:3333/api.

### Confirmação de e-mail em desenvolvimento

Abra o link verificationUrl do arquivo gerado em backend/.local-mail/. O link expira em 30 minutos e só pode ser usado uma vez. A pasta é privada e não deve ser publicada. Veja [EMAIL_LOCAL.md](backend/EMAIL_LOCAL.md) para SMTP e produção.

## Compilar e verificar tipos

~~~powershell
cd backend
npm.cmd run typecheck
npm.cmd run build
# Em frontend:
npm.cmd run typecheck
npm.cmd run build
~~~

## Testes e documentação do TCC

Relatórios e evidências reais em [docs/testes](docs/testes/RELATORIO_TESTES.md). Os comandos de reprodução estão em [README_REPRODUCAO.md](docs/testes/README_REPRODUCAO.md), e os cenários em [CASOS_DE_TESTE.md](docs/testes/CASOS_DE_TESTE.md).

Em 18/11/2026, a rodada documentada executou 195 casos, todos aprovados, em ambiente local isolado. Esses resultados não certificam segurança absoluta, acessibilidade ou desempenho na Internet; consulte os limites dos relatórios.

Dependências, credenciais, bancos de teste, links de confirmação, uploads e cópias privadas não fazem parte deste repositório. Os relatórios usam dados fictícios. Os dados de demonstração do banco local não são distribuídos com o código.

## Publicação para demonstração

Consulte [PUBLICACAO_RENDER.md](docs/PUBLICACAO_RENDER.md) e o `render.yaml` para a configuração dos serviços gratuitos. Sem SMTP configurado, a demonstração não confirma novos cadastros. O PostgreSQL Free expira em 30 dias e os uploads da API Free não são persistentes.
