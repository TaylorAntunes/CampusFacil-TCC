import api from './api';

export interface MessageUser {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface DirectMessage {
  id: string;
  content: string;
  read: boolean;
  createdAt: string;
  senderId: string;
  receiverId: string;
  sender: MessageUser;
  receiver: MessageUser;
}

export interface ConversationSummary {
  participantId: string;
  participant: MessageUser;
  latestMessage: DirectMessage;
  unreadCount: number;
}

function normalizeUser(user: any): MessageUser {
  const id =
    typeof user?.id === 'string' && user.id.trim()
      ? user.id
      : '';

  return {
    id,
    name:
      typeof user?.name === 'string' && user.name.trim()
        ? user.name
        : 'Usuario',
    email: typeof user?.email === 'string' ? user.email : undefined,
    avatar_url:
      typeof user?.avatar_url === 'string' ? user.avatar_url : undefined,
  };
}

export function normalizeMessage(message: any): DirectMessage {
  const senderId =
    typeof message?.senderId === 'string'
      ? message.senderId
      : typeof message?.sender?.id === 'string'
        ? message.sender.id
        : '';
  const receiverId =
    typeof message?.receiverId === 'string'
      ? message.receiverId
      : typeof message?.receiver?.id === 'string'
        ? message.receiver.id
        : '';

  return {
    id:
      typeof message?.id === 'string' && message.id.trim()
        ? message.id
        : crypto.randomUUID(),
    content: typeof message?.content === 'string' ? message.content : '',
    read: Boolean(message?.read),
    createdAt:
      message?.createdAt ??
      message?.created_at ??
      new Date().toISOString(),
    senderId,
    receiverId,
    sender: normalizeUser(message?.sender ?? { id: senderId }),
    receiver: normalizeUser(message?.receiver ?? { id: receiverId }),
  };
}

function normalizeConversation(conversation: any): ConversationSummary {
  const participant = normalizeUser(conversation?.participant);
  const latestMessage = normalizeMessage({
    ...conversation?.latestMessage,
    sender:
      conversation?.latestMessage?.sender ??
      (conversation?.latestMessage?.senderId === participant.id
        ? participant
        : undefined),
    receiver:
      conversation?.latestMessage?.receiver ??
      (conversation?.latestMessage?.receiverId === participant.id
        ? participant
        : undefined),
  });

  return {
    participantId: conversation?.participantId ?? participant.id,
    participant,
    latestMessage,
    unreadCount: Number(conversation?.unreadCount ?? 0),
  };
}

export const messagesService = {
  async getConversations(currentUserId?: string): Promise<{ conversations: ConversationSummary[] }> {
    const response = await api.get('/messages');
    const conversations = (response.data.conversations ?? []).map(normalizeConversation);

    return {
      conversations: currentUserId
        ? conversations.filter((conversation) => conversation.participantId !== currentUserId)
        : conversations,
    };
  },

  async getThread(participantId: string): Promise<{
    participant: MessageUser;
    messages: DirectMessage[];
  }> {
    const response = await api.get(`/messages/${participantId}`);
    return {
      participant: normalizeUser(response.data.participant),
      messages: (response.data.messages ?? []).map(normalizeMessage),
    };
  },

  async sendMessage(params: {
    recipientId: string;
    content: string;
  }): Promise<{ message: DirectMessage }> {
    const response = await api.post('/messages', params);
    return {
      message: normalizeMessage(response.data.message),
    };
  },

  async markThreadAsRead(participantId: string): Promise<void> {
    await api.patch(`/messages/${participantId}/read`);
  },

  normalizeMessage,
};
