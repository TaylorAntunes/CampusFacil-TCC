import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo, type ElementType } from 'react';
import {
  Bell,
  Menu,
  X,
  GraduationCap,
  ShoppingBag,
  LayoutList,
  LogOut,
  ChevronDown,
  User,
  Package,
  Star,
  MessageSquare,
  CheckCircle,
  Megaphone,
  Trash2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeonButton } from './NeonButton';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/utils';
import { categoriesService, Category } from '@/services/categories.service';
import { resolveApiAssetUrl } from '@/services/api';
import {
  notificationsService,
  Notification as BackendNotification,
} from '@/services/notifications.service';
import { io, type Socket } from '@/lib/socket';
import { SOCKET_URL } from '@/services/api';
import { string } from 'zod/v4';

const navLinks = [
  { href: '/explore', label: 'Explorar' },
  { href: '/conversas', label: 'Conversas', icon: MessageSquare },
  { href: '/meus-pedidos', label: 'Minhas solicitações', icon: ShoppingBag },
  { href: '/meus-anuncios', label: 'Meus Anúncios', icon: LayoutList },
];

type NotificationType = 'order' | 'review' | 'message' | 'done' | 'promo';

const NOTIF_ICON: Record<NotificationType, { icon: ElementType; cls: string }> = {
  order: { icon: Package, cls: 'bg-primary/10 text-primary' },
  review: { icon: Star, cls: 'bg-yellow-400/10 text-yellow-400' },
  message: { icon: MessageSquare, cls: 'bg-secondary/10 text-secondary' },
  done: { icon: CheckCircle, cls: 'bg-green-400/10 text-green-400' },
  promo: { icon: Megaphone, cls: 'bg-orange-400/10 text-orange-400' },
};

function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<BackendNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { notifications } = await notificationsService.getUserNotifications();
        setNotifs(notifications);
      } catch (error) {
        console.error(error);
        addToast('error', 'Erro ao carregar notificações');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [addToast]);

  useEffect(() => {
    if (!user) {
      socket?.disconnect();
      setSocket(null);
      return undefined;
    }

    const connection = io(SOCKET_URL, {
      auth: { token: localStorage.getItem('accessToken') ?? '' },
      transports: ['websocket'],
    });
    setSocket(connection);

    const handleIncoming = (notification: BackendNotification) => {
      const normalizedNotification =
        notificationsService.normalizeNotification(notification);
      setNotifs((prev) =>
        prev.some((n) => n.id === normalizedNotification.id)
          ? prev
          : [normalizedNotification, ...prev]
      );
      addToast('info', `Você recebeu uma nova notificação: ${normalizedNotification.message}`);
    };

    connection.on('new_notification', handleIncoming);

    return () => {
      connection.off('new_notification', handleIncoming);
      connection.disconnect();
      setSocket(null);
    };
  }, [user, addToast]);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = notifs.filter((n) => !n.read).length;

  const markAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error(error);
      addToast('error', 'Não foi possível marcar todas como lidas');
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifs((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error(error);
      addToast('error', 'Erro ao marcar notificação');
    }
  };

  const remove = async (id: string) => {
    try {
      await notificationsService.delete(id);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error(error);
      addToast('error', 'Erro ao remover notificação');
    }
  };

  const notificationItems = useMemo(
    () =>
      notifs.map((notif) => {
        const type = (notif.type as NotificationType) in NOTIF_ICON ? (notif.type as NotificationType) : 'message';
        const time = new Date(notif.createdAt);
        const formattedTime = time.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });
        return {
          id: notif.id,
          title: notif.metadata?.title ?? 'Nova atualização',
          body: notif.message,
          time: formattedTime,
          type,
          read: notif.read,
        };
      }),
    [notifs]
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-all group"
        aria-label="Notificações"
      >
        <Bell
          className={cn(
            'w-5 h-5 transition-colors',
            open ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
          )}
        />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary text-background text-[10px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(0,212,255,0.6)]"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-95 bg-card border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">Notificações</h3>
                {unread > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-semibold">
                    {unread} novas
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-primary hover:text-primary/70 transition-colors font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            <div className="notif-scrollbar max-h-105 overflow-y-auto divide-y divide-border/50">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Bell className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Carregando...</p>
                </div>
              ) : notificationItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Bell className="w-10 h-10 opacity-20" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                notificationItems.map((n) => {
                  const { icon: Icon, cls } = NOTIF_ICON[n.type];
                  return (
                    <motion.div
                      key={n.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex items-start gap-3 px-5 py-4 cursor-pointer group transition-colors',
                        !n.read ? 'bg-primary/3 hover:bg-primary/6' : 'hover:bg-white/3'
                      )}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                          cls
                        )}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              'text-xs font-semibold leading-snug',
                              !n.read ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {n.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground shrink-0">
                            {n.time}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                          {n.body}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            remove(n.id);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-red-400 transition-colors"
                          aria-label="Remover"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {notificationItems.length > 0 && (
              <div className="px-5 py-3 border-t border-border text-center">
                <button
                  onClick={() => setNotifs([])}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Limpar todas
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    navigate('/');
  };

  if (!user) return null;

  const userAvatar =
    resolveApiAssetUrl(user.avatarUrl ?? user.avatar_url) ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-all group"
      >
        <img
          src={userAvatar}
          alt={user.name}
          className="w-8 h-8 rounded-full border border-primary/30 object-cover"
        />
        <span className="text-sm font-medium hidden lg:block max-w-30 truncate">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50"
          >
            <div className="px-4 py-3.5 border-b border-border bg-white/3">
              <div className="flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-primary/20 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <nav className="py-2">
              {[
                { href: '/conversas', label: 'Conversas', icon: MessageSquare },
                { href: '/meus-pedidos', label: 'Minhas solicitações', icon: ShoppingBag },
                { href: '/meus-anuncios', label: 'Meus Anúncios', icon: LayoutList },
                {
                  href: `/seller/${user.id}`,
                  label: 'Meu Perfil',
                  icon: User,
                },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 hover:text-primary transition-all"
                >
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  {label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-border py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-400/10 transition-all"
              >
                <LogOut className="w-4 h-4" /> Sair
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let isMounted = true;
    categoriesService.getAll().then((data) => {
      if (isMounted) {
        setCategories(data.slice(0, 5));
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  }

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">

        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-neon flex items-center justify-center shadow-[0_0_15px_rgba(0,212,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-all">
              <GraduationCap className="w-6 h-6 text-background" />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Campus<span className="text-gradient">Fácil</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                to={href}
                className={cn(
                  'relative px-3 py-2 rounded-lg transition-all',
                  isActive(href)
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                {label}
                {isActive(href) && (
                  <span className="absolute inset-x-0 -bottom-px h-px bg-linear-to-r from-transparent via-primary to-transparent" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationDropdown />
              <div className="w-px h-6 bg-border mx-1" />
              <UserDropdown />
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3">
                Entrar
              </Link>
              <Link to="/register">
                <NeonButton size="sm">Cadastrar</NeonButton>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setIsMenuOpen((prev) => !prev)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 flex flex-col gap-2">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                to={href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all',
                  isActive(href) ? 'text-primary bg-primary/10' : 'text-foreground hover:bg-white/5'
                )}
              >
                {Icon && <Icon className="w-5 h-5" />}
                {label}
              </Link>
            ))}
          </nav>
          <div className="h-px bg-border my-2" />
          <div className="flex flex-col gap-3 px-2">
            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">Categorias</span>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/explore?category=${category.id}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                {category.name}
              </Link>
            ))}
          </div>
          <div className="h-px bg-border my-2" />
          {isAuthenticated ? (
            <button
              onClick={() => {
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 text-base font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" /> Sair
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-base font-medium px-4 py-3 block">
                Entrar
              </Link>
              <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                <NeonButton className="w-full mt-1">Cadastrar</NeonButton>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
