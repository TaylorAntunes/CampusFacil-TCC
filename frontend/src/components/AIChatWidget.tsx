import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bot,
  User,
  RotateCcw,
  MessageCircle,
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FAQ: { question: string; answer: string }[] = [
  {
    question: '📚 Como solicitar um serviço?',
    answer:
      'Acesse "Explorar", consulte um anúncio e clique em "Solicitar serviço". Descreva sua necessidade e aguarde a resposta do prestador. Acompanhe o andamento em "Minhas solicitações".',
  },
  {
    question: '📢 Como criar um anúncio?',
    answer:
      'Acesse "Meus Anúncios" e selecione "Novo anúncio". Informe título, descrição, categoria e valor. Você pode oferecer monitoria, auxílio em programação, design de apresentações ou outros serviços relacionados ao campus.',
  },
  {
    question: '💬 Como funciona o sistema de mensagens?',
    answer:
      'Clique em "Conversas" no menu para ver todas as suas mensagens em tempo real. Você também pode iniciar uma conversa pela página de um anúncio ou pelo perfil de um prestador.',
  },
  {
    question: '⭐ Como avaliar um serviço?',
    answer:
      'Após a conclusão de uma solicitação, registre sua avaliação em "Minhas solicitações". As experiências compartilhadas ajudam outros participantes a conhecer os serviços.',
  },
  {
    question: '🎓 Quem pode se cadastrar?',
    answer:
      'O cadastro é destinado à comunidade acadêmica do IFCE e aceita e-mails com o domínio institucional @ifce.edu.br. Não compartilhe sua senha com outras pessoas.',
  },
  {
    question: '💬 Como combinar as condições do serviço?',
    answer:
      'Combine escopo, prazos e eventuais valores diretamente com o prestador pelas conversas. O CampusFácil organiza anúncios e solicitações, mas não processa pagamentos nem garante resultados.',
  },
];

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content:
    'Olá! Consulte as perguntas frequentes para saber como utilizar o CampusFácil na comunidade acadêmica do IFCE.',
};

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const showFAQ = messages.length === 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleFAQ(item: { question: string; answer: string }) {
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: item.question },
      { role: 'assistant', content: item.answer },
    ]);
  }

  function reset() {
    setMessages([INITIAL_MESSAGE]);
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            key="bubble"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow:
                '0 0 20px hsl(var(--primary) / 0.5), 0 0 40px hsl(var(--primary) / 0.25)',
            }}
            aria-label="Abrir ajuda"
          >
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 4, duration: 0.5 }}
            >
              <MessageCircle
                className="h-6 w-6"
                style={{ color: 'hsl(var(--primary-foreground))' }}
              />
            </motion.div>
            <span
              className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2"
              style={{
                background: '#22c55e',
                borderColor: 'hsl(var(--background))',
              }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl"
            style={{
              width: '370px',
              maxHeight: '540px',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--primary) / 0.2)',
              boxShadow:
                '0 0 40px hsl(var(--primary) / 0.1), 0 20px 60px rgba(0,0,0,0.18)',
            }}
          >
            <div
              className="flex shrink-0 items-center gap-3 px-4 py-3"
              style={{
                background: 'hsl(var(--card))',
                borderBottom: '1px solid hsl(var(--primary) / 0.15)',
              }}
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: 'hsl(var(--primary) / 0.15)',
                  border: '1px solid hsl(var(--primary) / 0.3)',
                }}
              >
                <Bot
                  className="h-5 w-5"
                  style={{ color: 'hsl(var(--primary))' }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="text-sm font-semibold"
                  style={{ color: 'hsl(var(--foreground))' }}
                >
                  Ajuda CampusFácil
                </p>
                <p
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-400" />
                  Perguntas frequentes
                </p>
              </div>

              <div className="ml-auto flex shrink-0 items-center gap-0.5">
                {!showFAQ && (
                  <button
                    onClick={reset}
                    className="rounded-lg p-1.5 transition-colors"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'hsl(var(--primary))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                    }}
                    title="Voltar às dúvidas"
                    aria-label="Recomeçar"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 transition-colors"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--foreground))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                  }}
                  aria-label="Fechar"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4"
              style={{ height: '400px', background: 'hsl(var(--background))' }}
            >
              {messages.map((msg, index) => (
                <motion.div
                  key={`${msg.role}-${index}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${
                    msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                    style={
                      msg.role === 'assistant'
                        ? {
                            background: 'hsl(var(--primary) / 0.15)',
                            border: '1px solid hsl(var(--primary) / 0.3)',
                          }
                        : {
                            background: 'hsl(var(--secondary) / 0.2)',
                            border: '1px solid hsl(var(--secondary) / 0.3)',
                          }
                    }
                  >
                    {msg.role === 'assistant' ? (
                      <Bot
                        className="h-4 w-4"
                        style={{ color: 'hsl(var(--primary))' }}
                      />
                    ) : (
                      <User
                        className="h-4 w-4"
                        style={{ color: 'hsl(var(--secondary))' }}
                      />
                    )}
                  </div>

                  <div
                    className="max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed"
                    style={
                      msg.role === 'user'
                        ? {
                            background: 'hsl(var(--secondary) / 0.25)',
                            border: '1px solid hsl(var(--secondary) / 0.35)',
                            color: 'hsl(var(--foreground))',
                            borderTopRightRadius: '4px',
                          }
                        : {
                            background: 'hsl(var(--muted))',
                            border: '1px solid hsl(var(--primary) / 0.15)',
                            color: 'hsl(var(--foreground))',
                            borderTopLeftRadius: '4px',
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {showFAQ && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25, delay: 0.15 }}
                    className="space-y-2 pt-1"
                  >
                    <p
                      className="px-1 text-xs"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                    >
                      Selecione uma dúvida:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {FAQ.map((item, index) => (
                        <motion.button
                          key={item.question}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.2,
                            delay: 0.1 + index * 0.05,
                          }}
                          onClick={() => handleFAQ(item)}
                          className="rounded-xl px-3 py-2 text-left text-xs transition-all"
                          style={{
                            background: 'hsl(var(--primary) / 0.06)',
                            border: '1px solid hsl(var(--primary) / 0.2)',
                            color: 'hsl(var(--primary))',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              'hsl(var(--primary) / 0.14)';
                            e.currentTarget.style.borderColor =
                              'hsl(var(--primary) / 0.4)';
                            e.currentTarget.style.color =
                              'hsl(var(--primary))';
                            e.currentTarget.style.boxShadow =
                              '0 0 12px hsl(var(--primary) / 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              'hsl(var(--primary) / 0.06)';
                            e.currentTarget.style.borderColor =
                              'hsl(var(--primary) / 0.2)';
                            e.currentTarget.style.color =
                              'hsl(var(--primary))';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {item.question}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!showFAQ && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                    className="flex justify-center pt-1"
                  >
                    <button
                      onClick={reset}
                      className="rounded-full px-4 py-1.5 text-xs transition-all"
                      style={{
                        color: 'hsl(var(--primary))',
                        border: '1px solid hsl(var(--primary) / 0.25)',
                        background: 'hsl(var(--primary) / 0.06)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'hsl(var(--primary) / 0.14)';
                        e.currentTarget.style.borderColor =
                          'hsl(var(--primary) / 0.4)';
                        e.currentTarget.style.boxShadow =
                          '0 0 10px hsl(var(--primary) / 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'hsl(var(--primary) / 0.06)';
                        e.currentTarget.style.borderColor =
                          'hsl(var(--primary) / 0.25)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      ← Ver outras dúvidas
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
