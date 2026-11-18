import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Send,
  Loader2,
  ArrowLeft,
  Check,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { io, type Socket } from '@/lib/socket';
import { resolveApiAssetUrl, SOCKET_URL } from '@/services/api';
import {
  messagesService,
  type ConversationSummary,
  type DirectMessage,
  type MessageUser,
} from '@/services/messages.service';
import { cn } from '@/lib/utils';

function formatConversationTime(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getMessageUserId(message: DirectMessage, side: 'sender' | 'receiver') {
  const nestedUser = side === 'sender' ? message.sender : message.receiver;
  const directId = side === 'sender' ? message.senderId : message.receiverId;

  return nestedUser.id || directId || '';
}

function isOwnMessage(
  message: DirectMessage,
  currentUserId?: string,
  activeParticipantId?: string,
) {
  if (!currentUserId) return false;

  const senderId = getMessageUserId(message, 'sender');
  const receiverId = getMessageUserId(message, 'receiver');

  if (senderId === currentUserId) return true;
  if (receiverId === currentUserId) return false;

  if (activeParticipantId) {
    if (senderId === activeParticipantId) return false;
    if (receiverId === activeParticipantId) return true;
  }

  return false;
}

function ConversationAvatar({
  participant,
  size = 'md',
}: {
  participant: MessageUser;
  size?: 'xs' | 'sm' | 'md';
}) {
  const src =
    resolveApiAssetUrl(participant.avatar_url) ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${participant.name}`;

  return (
    <img
      src={src}
      alt={participant.name}
      className={cn(
        'rounded-full border border-primary/20 object-cover',
        size === 'xs'
          ? 'h-8 w-8'
          : size === 'sm'
            ? 'h-10 w-10'
            : 'h-12 w-12',
      )}
    />
  );
}

export default function ConversationsPage() {
  const { participantId } = useParams<{ participantId?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [participant, setParticipant] = useState<MessageUser | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const deferredSearch = useDeferredValue(search);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  const mergeConversation = (
    current: ConversationSummary[],
    nextConversation: ConversationSummary,
  ) => {
    if (nextConversation.participantId === user?.id) {
      return current.filter((conversation) => conversation.participantId !== user.id);
    }

    const remaining = current.filter(
      (conversation) => conversation.participantId !== nextConversation.participantId,
    );

    return [nextConversation, ...remaining].sort(
      (left, right) =>
        new Date(right.latestMessage.createdAt).getTime() -
        new Date(left.latestMessage.createdAt).getTime(),
    );
  };

  const appendMessage = (current: DirectMessage[], nextMessage: DirectMessage) => {
    if (current.some((message) => message.id === nextMessage.id)) return current;

    return [...current, nextMessage].sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  };

  useEffect(() => {
    let isMounted = true;

    const loadConversations = async () => {
      try {
        setIsLoadingConversations(true);
        const response = await messagesService.getConversations(user?.id);
        if (!isMounted) return;
        setConversations(response.conversations);

        if (!participantId && response.conversations.length > 0) {
          navigate(`/conversas/${response.conversations[0].participantId}`, {
            replace: true,
          });
        }
      } catch (error) {
        console.error(error);
        addToast('error', 'Nao foi possivel carregar as conversas.');
      } finally {
        if (isMounted) {
          setIsLoadingConversations(false);
        }
      }
    };

    loadConversations();

    return () => {
      isMounted = false;
    };
  }, [addToast, navigate, participantId, user?.id]);

  useEffect(() => {
    if (!participantId) {
      setParticipant(null);
      setMessages([]);
      return;
    }

    if (participantId === user?.id) {
      setParticipant(null);
      setMessages([]);
      navigate('/conversas', { replace: true });
      return;
    }

    let isMounted = true;

    const loadThread = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await messagesService.getThread(participantId);
        if (!isMounted) return;
        setParticipant(response.participant);
        setMessages(response.messages);
        await messagesService.markThreadAsRead(participantId);
        if (!isMounted) return;
        setConversations((current) =>
          current.map((conversation) =>
            conversation.participantId === participantId
              ? { ...conversation, unreadCount: 0 }
              : conversation,
          ),
        );
        requestAnimationFrame(() => scrollToBottom('auto'));
      } catch (error) {
        console.error(error);
        addToast('error', 'Nao foi possivel carregar esta conversa.');
      } finally {
        if (isMounted) {
          setIsLoadingMessages(false);
        }
      }
    };

    loadThread();

    return () => {
      isMounted = false;
    };
  }, [addToast, navigate, participantId, user?.id]);

  useEffect(() => {
    if (!user) return undefined;

    const socket: Socket = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') ?? '' },
      transports: ['websocket'],
    });

    const handleIncomingMessage = async (incoming: DirectMessage) => {
      const normalized = messagesService.normalizeMessage(incoming);
      if (normalized.senderId === user.id && normalized.receiverId === user.id) {
        return;
      }

      const isOwn = isOwnMessage(normalized, user.id, participantId);
      const otherParticipant = isOwn
        ? normalized.receiver
        : normalized.sender;

      setConversations((current) => {
        const existing = current.find(
          (conversation) => conversation.participantId === otherParticipant.id,
        );

        const nextConversation: ConversationSummary = {
          participantId: otherParticipant.id,
          participant:
            otherParticipant.id || !existing?.participant
              ? otherParticipant
              : existing.participant,
          latestMessage: normalized,
          unreadCount:
            !isOwn && participantId !== otherParticipant.id
              ? (existing?.unreadCount ?? 0) + 1
              : existing?.participantId === otherParticipant.id && !isOwn
                ? 0
                : (existing?.unreadCount ?? 0),
        };

        return mergeConversation(current, nextConversation);
      });

      if (
        participantId &&
        (normalized.senderId === participantId || normalized.receiverId === participantId)
      ) {
        setMessages((current) => appendMessage(current, normalized));

        if (!isOwn) {
          setParticipant((current) => current ?? otherParticipant);
          await messagesService.markThreadAsRead(participantId);
        }

        requestAnimationFrame(() => scrollToBottom());
      }
    };

    const handleThreadRead = ({
      participantId: readParticipantId,
    }: {
      participantId?: string;
    }) => {
      if (!readParticipantId) return;

      setConversations((current) =>
        current.map((conversation) =>
          conversation.participantId === readParticipantId
            ? {
                ...conversation,
                latestMessage: {
                  ...conversation.latestMessage,
                  read: true,
                },
              }
            : conversation,
        ),
      );

      if (participantId === readParticipantId) {
        setMessages((current) =>
          current.map((message) =>
            message.receiverId === readParticipantId
              ? { ...message, read: true }
              : message,
          ),
        );
      }
    };

    socket.on('new_message', handleIncomingMessage);
    socket.on('thread_read', handleThreadRead);

    return () => {
      socket.off('new_message', handleIncomingMessage);
      socket.off('thread_read', handleThreadRead);
      socket.disconnect();
    };
  }, [participantId, user]);

  useEffect(() => {
    if (messages.length === 0) return;
    requestAnimationFrame(() => scrollToBottom('auto'));
  }, [messages.length]);

  const filteredConversations = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    if (!query) return conversations;

    return conversations.filter((conversation) =>
      conversation.participant.name.toLowerCase().includes(query),
    );
  }, [conversations, deferredSearch]);

  const handleSelectConversation = (nextParticipantId: string) => {
    navigate(`/conversas/${nextParticipantId}`);
  };

  const handleSendMessage = async () => {
    const trimmedDraft = draft.trim();

    if (!participantId || !trimmedDraft) return;
    if (participantId === user?.id) {
      addToast('error', 'Voce nao pode enviar mensagem para si mesmo.');
      return;
    }

    setIsSending(true);

    try {
      const response = await messagesService.sendMessage({
        recipientId: participantId,
        content: trimmedDraft,
      });

      setMessages((current) => appendMessage(current, response.message));
      setDraft('');

      setConversations((current) => {
        const existing = current.find(
          (conversation) => conversation.participantId === participantId,
        );

        const nextConversation: ConversationSummary = {
          participantId,
          participant: participant ?? existing?.participant ?? response.message.receiver,
          latestMessage: response.message,
          unreadCount: 0,
        };

        return mergeConversation(current, nextConversation);
      });

      requestAnimationFrame(() => scrollToBottom());
    } catch (error) {
      console.error(error);
      addToast('error', 'Nao foi possivel enviar a mensagem.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-full overflow-hidden bg-background">
      <div className="container mx-auto flex h-full min-h-0 flex-col px-4 py-4">
        <div className="mb-4 flex shrink-0 items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-primary/70">
              Conversas
            </p>
            <h1 className="text-3xl font-bold">Participantes e mensagens</h1>
          </div>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao painel
          </Link>
        </div>

        <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-border bg-card">
            <div className="border-b border-border px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Inbox</h2>
                  <p className="text-xs text-muted-foreground">
                    Fale com interessados no seu servico
                  </p>
                </div>
              </div>

              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar participante..."
                  className="h-11 w-full rounded-2xl border border-border bg-background px-11 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="chat-scrollbar min-h-0 flex-1 overflow-y-auto">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center px-6 py-12 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando conversas...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <p className="font-medium">Nenhuma conversa ainda</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    As mensagens recebidas de outros participantes serão exibidas aqui.
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.participantId}
                    type="button"
                    onClick={() => handleSelectConversation(conversation.participantId)}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-border/60 px-5 py-4 text-left transition-colors hover:bg-white/5',
                      participantId === conversation.participantId && 'bg-primary/5',
                    )}
                  >
                    <ConversationAvatar participant={conversation.participant} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate font-semibold">
                          {conversation.participant.name}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatConversationTime(conversation.latestMessage.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {conversation.latestMessage.content}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 ? (
                      <span className="mt-1 inline-flex min-w-6 items-center justify-center rounded-full bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground">
                        {conversation.unreadCount}
                      </span>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </section>

          <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border border-border bg-card">
            {!participantId || !participant ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-primary/20 bg-primary/10">
                  <MessageSquare className="h-9 w-9 text-primary" />
                </div>
                <h2 className="mt-6 text-2xl font-bold">Selecione uma conversa</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Selecione um participante na lista lateral para conversar
                  sobre serviços e solicitações sem sair da página.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4 border-b border-border px-6 py-4">
                  <ConversationAvatar participant={participant} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                      {participant.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {participant.email || 'Participante do CampusFácil'}
                    </p>
                  </div>
                </div>

                <div
                  ref={messagesContainerRef}
                  className="chat-scrollbar min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(0,212,255,0.08),_transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] px-6 py-6"
                >
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando mensagens...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-center">
                      <div>
                        <p className="font-medium">Nenhuma mensagem ainda</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Envie a primeira resposta para iniciar a conversa.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.map((message, index) => {
                        const ownMessage = isOwnMessage(
                          message,
                          user?.id,
                          participantId,
                        );
                        const messageAuthor = ownMessage
                          ? message.sender
                          : message.sender.id
                            ? message.sender
                            : participant;
                        const showDate =
                          index === 0 ||
                          new Date(messages[index - 1].createdAt).toDateString() !==
                            new Date(message.createdAt).toDateString();

                        return (
                          <div key={message.id}>
                            {showDate ? (
                              <div className="mb-4 flex justify-center">
                                <span className="rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] text-muted-foreground">
                                  {new Date(message.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'long',
                                  })}
                                </span>
                              </div>
                            ) : null}

                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn(
                                'flex w-full items-end gap-3',
                                ownMessage ? 'justify-end' : 'justify-start',
                              )}
                            >
                              {!ownMessage ? (
                                <ConversationAvatar
                                  participant={messageAuthor}
                                  size="xs"
                                />
                              ) : null}
                              <div
                                className={cn(
                                  'max-w-[78%] px-4 py-3 text-sm shadow-[0_10px_30px_rgba(0,0,0,0.12)]',
                                  ownMessage
                                    ? 'rounded-[24px] rounded-br-md bg-primary text-primary-foreground'
                                    : 'rounded-[24px] rounded-bl-md border border-border bg-muted text-foreground',
                                )}
                              >
                                <p
                                  className={cn(
                                    'mb-1 text-[11px] font-semibold',
                                    ownMessage
                                      ? 'text-primary-foreground/80'
                                      : 'text-muted-foreground',
                                  )}
                                >
                                  {ownMessage
                                    ? user?.name ?? 'Voce'
                                    : messageAuthor.name}
                                </p>
                                <p className="whitespace-pre-wrap break-words">
                                  {message.content}
                                </p>
                                <div
                                  className={cn(
                                    'mt-2 flex items-center justify-end gap-1.5 text-[10px]',
                                    ownMessage
                                      ? 'text-primary-foreground/75'
                                      : 'text-muted-foreground',
                                  )}
                                >
                                  <span>
                                    {new Date(message.createdAt).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                  {ownMessage ? (
                                    <span className="inline-flex items-center gap-1">
                                      {message.read ? (
                                        <>
                                          <CheckCheck className="h-3 w-3" />
                                          Visualizada
                                        </>
                                      ) : (
                                        <>
                                          <Check className="h-3 w-3" />
                                          Enviada
                                        </>
                                      )}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              {ownMessage ? (
                                <ConversationAvatar
                                  participant={message.sender}
                                  size="xs"
                                />
                              ) : null}
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-border bg-background/70 px-5 py-4">
                  <div className="flex items-end gap-3 rounded-[26px] border border-border bg-card px-4 py-3">
                    <textarea
                      rows={1}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault();
                          void handleSendMessage();
                        }
                      }}
                      placeholder="Digite sua mensagem..."
                      className="max-h-40 min-h-[28px] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSendMessage()}
                      disabled={isSending || !draft.trim()}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground transition-opacity disabled:opacity-60"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
