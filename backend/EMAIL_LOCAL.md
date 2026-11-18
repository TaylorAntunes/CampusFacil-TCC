# Confirmação institucional em desenvolvimento

Novas contas e contas anteriores sem confirmação precisam confirmar o e-mail antes de entrar. Em modo dev/test, os links são gravados em backend/.local-mail/*.json. Abra o verificationUrl localmente. Os links têm validade de 30 minutos, uso único e só o hash é salvo no banco. Não publique essa pasta nem envie os arquivos para terceiros.

O modo local foi solicitado para desenvolvimento; ele não comprova entrega em caixa de correio real. Em produção, configure EMAIL_DELIVERY=smtp, SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASSWORD e SMTP_FROM. O modo local é bloqueado quando NODE_ENV=production.

As sessões anteriores à migração serão invalidadas. Na tela de login, solicite a confirmação para contas já existentes. Nenhuma conta será marcada como verificada automaticamente.
