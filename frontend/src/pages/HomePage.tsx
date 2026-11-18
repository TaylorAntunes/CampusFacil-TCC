import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  ShoppingBag,
  Star,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Eye,
  Plus,
  Activity,
  Package,
  Users,
  XCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { dashboardService, DashboardStats } from '../services/dashboard.service';
import { serviceRequestsService, ServiceRequest, ServiceRequestStatus } from '../services/service-requests.service';
import { advertisementsService, Advertisement } from '../services/advertisements.service';
import { resolveApiAssetUrl } from '@/services/api';

const STATUS_STYLE: Record<ServiceRequestStatus, { label: string; cls: string; dot: string }> = {
  PENDING: {
    label: 'Aguardando aceite',
    cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  ACCEPTED: {
    label: 'Aguardando pagamento',
    cls: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    dot: 'bg-blue-400',
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    cls: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  COMPLETED: {
    label: 'Concluído',
    cls: 'text-green-400 bg-green-400/10 border-green-400/20',
    dot: 'bg-green-400',
  },
  REJECTED: {
    label: 'Recusado',
    cls: 'text-red-400 bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
  },
  CANCELLED: {
    label: 'Cancelado',
    cls: 'text-red-400 bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
  },
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-muted-foreground mb-1 font-medium">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name === 'receita' ? `R$ ${p.value.toLocaleString('pt-BR')}` : `${p.value} solicitações`}
        </p>
      ))}
    </div>
  );
};

const fadeIn = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

const resolveListingImageUrl = (image?: string, seed = 'campusfacil'): string =>
  resolveApiAssetUrl(image) ?? `https://picsum.photos/seed/${seed}/600/400`;

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

const isSameMonth = (value: string | Date | undefined, targetKey: string) => {
  if (!value) return false;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return getMonthKey(date) === targetKey;
};

const calculatePercentChange = (current: number, previous: number) => {
  if (previous === 0) {
    if (current === 0) {
      return { value: 0, direction: 'neutral' as const, label: '0%' };
    }
    return { value: 100, direction: 'up' as const, label: '+100%' };
  }

  const change = ((current - previous) / previous) * 100;
  if (change === 0) {
    return { value: 0, direction: 'neutral' as const, label: '0%' };
  }

  return {
    value: change,
    direction: change > 0 ? ('up' as const) : ('down' as const),
    label: `${change > 0 ? '+' : ''}${Math.round(change)}%`,
  };
};

export function HomePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<ServiceRequest[]>([]);
  const [listings, setListings] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, ordersRes, listingsRes] = await Promise.all([
          dashboardService.getStats(),
          serviceRequestsService.getUserServiceRequests(),
          advertisementsService.getUserAdvertisements(),
        ]);
        if (controller.signal.aborted) return;
        setStats(statsRes.stats);
        setOrders(ordersRes.serviceRequests);
        setListings(listingsRes.advertisements);
      } catch (error) {
        console.error(error);
        addToast('error', 'Erro ao carregar o painel');
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, [addToast]);

  const months = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('pt-BR', { month: 'short' });
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      return { key, label: formatter.format(date).replace('.', '') };
    });
  }, []);

  const providerOrders = useMemo(() => {
    return orders.filter((order) => order.advertisement?.author?.id === user?.id);
  }, [orders, user]);

  const paidProviderOrders = useMemo(() => {
    return providerOrders.filter((order) => ['IN_PROGRESS', 'COMPLETED'].includes(order.status));
  }, [providerOrders]);

  const monthlyChartData = useMemo(() => {
    const map = new Map(months.map((month) => [month.key, { month: month.label, receita: 0, vendas: 0 }]));
    paidProviderOrders.forEach((order) => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const entry = map.get(key);
      if (!entry) return;
      entry.receita += Number(order.advertisement?.price ?? 0);
      entry.vendas += 1;
    });
    return Array.from(map.values());
  }, [months, paidProviderOrders]);

  const categoryData = useMemo(() => {
    const counter = new Map<string, number>();
    orders.forEach((order) => {
      const category = order.advertisement?.category?.name ?? 'Outros';
      counter.set(category, (counter.get(category) ?? 0) + 1);
    });
    return Array.from(counter.entries()).map(([cat, vendas]) => ({ cat, vendas })).slice(0, 5);
  }, [orders]);

  const recentOrders = useMemo(() => {
    const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sorted.slice(0, 5).map((order) => ({
      id: order.id,
      client: order.requester?.name ?? 'Solicitante',
      avatar: order.requester?.avatar_url
        ? resolveApiAssetUrl(order.requester.avatar_url) ?? order.requester.avatar_url
        : `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.requester?.name ?? 'client'}`,
      service: order.advertisement?.title ?? 'Serviço removido',
      value: order.advertisement?.price ?? 0,
      rawStatus: order.status,
      date: new Date(order.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      serviceId: order.advertisement?.id,
      isProviderView: order.advertisement?.author?.id === user?.id,
    }));
  }, [orders, user]);

  const pendingReceivedOrders = useMemo(() => {
    return recentOrders.filter((order) => order.isProviderView && order.rawStatus === 'PENDING');
  }, [recentOrders]);

  const recentPurchases = useMemo(() => {
    return recentOrders.filter((order) => !order.isProviderView);
  }, [recentOrders]);

  const handleProviderStatusUpdate = async (
    requestId: string,
    status: Extract<ServiceRequestStatus, 'ACCEPTED' | 'REJECTED'>,
  ) => {
    try {
      setUpdatingOrderId(requestId);
      const { serviceRequest } = await serviceRequestsService.updateStatus(requestId, status);
      setOrders((prev) => prev.map((order) => (order.id === serviceRequest.id ? serviceRequest : order)));
      addToast('success', status === 'ACCEPTED' ? 'Pedido aceito com sucesso' : 'Pedido recusado');
    } catch (error) {
      console.error(error);
      addToast('error', 'Não foi possível atualizar o pedido');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const trendData = useMemo(() => {
    const now = new Date();
    const currentMonthKey = getMonthKey(now);
    const previousMonthKey = getMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));

    const currentMonthRevenue = paidProviderOrders
      .filter((order) => isSameMonth(order.createdAt, currentMonthKey))
      .reduce((sum, order) => sum + Number(order.advertisement?.price ?? 0), 0);

    const previousMonthRevenue = paidProviderOrders
      .filter((order) => isSameMonth(order.createdAt, previousMonthKey))
      .reduce((sum, order) => sum + Number(order.advertisement?.price ?? 0), 0);

    const currentMonthSales = paidProviderOrders.filter((order) =>
      isSameMonth(order.createdAt, currentMonthKey),
    ).length;

    const previousMonthSales = paidProviderOrders.filter((order) =>
      isSameMonth(order.createdAt, previousMonthKey),
    ).length;

    const currentMonthActive = providerOrders.filter((order) =>
      order.status === 'IN_PROGRESS' && isSameMonth(order.createdAt, currentMonthKey),
    ).length;

    const previousMonthActive = providerOrders.filter((order) =>
      order.status === 'IN_PROGRESS' && isSameMonth(order.createdAt, previousMonthKey),
    ).length;

    const currentMonthAds = listings.filter((listing) =>
      isSameMonth(listing.createdAt, currentMonthKey),
    ).length;

    const previousMonthAds = listings.filter((listing) =>
      isSameMonth(listing.createdAt, previousMonthKey),
    ).length;

    const allReviews = listings.flatMap((listing) =>
      (listing.reviews ?? []).map((review) => ({
        rating: review.rating,
        createdAt: review.created_at,
      })),
    );

    const currentMonthReviews = allReviews.filter((review) =>
      isSameMonth(review.createdAt, currentMonthKey),
    );
    const previousMonthReviews = allReviews.filter((review) =>
      isSameMonth(review.createdAt, previousMonthKey),
    );

    const currentMonthRating = currentMonthReviews.length
      ? currentMonthReviews.reduce((sum, review) => sum + review.rating, 0) / currentMonthReviews.length
      : stats?.rating ?? 0;

    const previousMonthRating = previousMonthReviews.length
      ? previousMonthReviews.reduce((sum, review) => sum + review.rating, 0) / previousMonthReviews.length
      : currentMonthRating;

    const currentMonthClients = new Set(
      providerOrders
        .filter((order) => isSameMonth(order.createdAt, currentMonthKey))
        .map((order) => order.requesterId),
    ).size;

    const previousMonthClients = new Set(
      providerOrders
        .filter((order) => isSameMonth(order.createdAt, previousMonthKey))
        .map((order) => order.requesterId),
    ).size;

    return {
      publishedAdvertisements: calculatePercentChange(currentMonthAds, previousMonthAds),
      monthlyEarnings: calculatePercentChange(currentMonthRevenue, previousMonthRevenue),
      contracts: calculatePercentChange(currentMonthSales, previousMonthSales),
      activeServiceRequests: calculatePercentChange(currentMonthActive, previousMonthActive),
      rating: calculatePercentChange(currentMonthRating, previousMonthRating),
      uniqueClients: calculatePercentChange(currentMonthClients, previousMonthClients),
    };
  }, [listings, paidProviderOrders, providerOrders, stats?.rating, user]);

  const statsCatalog = [
    {
      icon: Package,
      label: 'Anúncios Ativos',
      value: stats?.publishedAdvertisements.toString() ?? '0',
      sub: 'serviços publicados',
      color: 'bg-primary/10 text-primary',
      delay: 0,
      trend: trendData.publishedAdvertisements,
    },
    {
      icon: DollarSign,
      label: 'Valor dos serviços',
      value: stats ? `R$ ${stats.monthlyEarnings.toLocaleString('pt-BR')}` : 'R$ 0',
      sub: 'valores de referência dos anúncios',
      color: 'bg-green-400/10 text-green-400',
      delay: 0.06,
      trend: trendData.monthlyEarnings,
    },
    {
      icon: TrendingUp,
      label: 'Contratações',
      value: stats ? `${stats.contracts}` : '0',
      sub: 'contratos ativos',
      color: 'bg-secondary/10 text-secondary',
      delay: 0.12,
      trend: trendData.contracts,
    },
    {
      icon: Clock,
      label: 'Em Andamento',
      value: stats?.activeServiceRequests.toString() ?? '0',
      sub: 'pedidos ativos',
      color: 'bg-yellow-400/10 text-yellow-400',
      delay: 0.18,
      trend: trendData.activeServiceRequests,
    },
    {
      icon: Star,
      label: 'Avaliação Média',
      value: stats ? stats.rating.toFixed(1) : '0.0',
      sub: 'baseado em avaliações',
      color: 'bg-orange-400/10 text-orange-400',
      delay: 0.24,
      trend: trendData.rating,
    },
    {
      icon: Users,
      label: 'Mensagens não lidas',
      value: stats?.unreadMessages.toString() ?? '0',
      sub: 'mensagens recebidas',
      color: 'bg-blue-400/10 text-blue-400',
      delay: 0.3,
      trend: trendData.uniqueClients,
    },
  ];

  const quickActions = useMemo(
    () => [
      { icon: Plus, label: 'Criar Anúncio', href: '/meus-anuncios' },
      { icon: ShoppingBag, label: 'Minhas solicitações', href: '/meus-pedidos' },
      { icon: ArrowRight, label: 'Explorar', href: '/explore' },
      { icon: Star, label: 'Ver Perfil', href: `/seller/${user?.id ?? 's1'}` },
    ],
    [user]
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border bg-card/30 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <motion.div variants={fadeIn}>
              <div>
                <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
                <h1 className="text-2xl font-bold">{user?.name ?? 'Participante do CampusFácil'}</h1>
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-3">
              <Link to="/meus-anuncios">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all">
                  <Eye className="w-4 h-4" /> Ver Anúncios
                </button>
              </Link>
              <Link to="/meus-anuncios">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)] transition-all">
                  <Plus className="w-4 h-4" /> Novo Anúncio
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsCatalog.map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay, duration: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6 hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs flex items-center gap-1 font-medium ${
                    stat.trend.direction === 'up'
                      ? 'text-green-400'
                      : stat.trend.direction === 'down'
                        ? 'text-red-400'
                        : 'text-muted-foreground'
                  }`}
                >
                  {stat.trend.direction === 'down' ? (
                    <ArrowDownRight className="w-3 h-3" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
                  {stat.trend.label}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm font-medium text-foreground mb-0.5">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Valor dos serviços por mês</h2>
                <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
              </div>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyChartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(192 100% 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(192 100% 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(210 15% 60%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(210 15% 60%)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: 'hsl(220 15% 14% / 0.35)' }}
                />
                <Area type="monotone" dataKey="receita" stroke="hsl(192 100% 50%)" strokeWidth={2} fill="url(#gradRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold">Solicitações por categoria</h2>
                <p className="text-sm text-muted-foreground">Solicitações registradas</p>
              </div>
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
                <XAxis dataKey="cat" tick={{ fill: 'hsl(210 15% 60%)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'hsl(210 15% 60%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="vendas" radius={[6, 6, 0, 0]} activeBar={false}>
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'hsl(192 100% 50%)' : `hsl(192 100% ${40 + index * 5}% / 0.7)`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">Pedidos para aprovar</h2>
                <p className="text-sm text-muted-foreground">Solicitações que aguardam sua resposta como prestador</p>
              </div>
            </div>

            <div className="divide-y divide-border">
              {pendingReceivedOrders.length === 0 ? (
                <div className="px-6 py-8 text-sm text-muted-foreground">
                  Nenhum pedido pendente de aprovação no momento.
                </div>
              ) : (
                pendingReceivedOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.32 + index * 0.05 }}
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img
                        src={order.avatar}
                        alt={order.client}
                        className="w-11 h-11 rounded-full border border-border shrink-0 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{order.client}</p>
                        <p className="text-sm text-muted-foreground truncate">{order.service}</p>
                        <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap md:justify-end">
                      <span className="text-sm font-bold text-primary">
                        R$ {order.value.toLocaleString('pt-BR')}
                      </span>
                      <button
                        onClick={() => handleProviderStatusUpdate(order.id, 'ACCEPTED')}
                        disabled={updatingOrderId === order.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-green-400/20 bg-green-400/10 px-4 py-2 text-sm font-medium text-green-400 transition-all hover:bg-green-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aceitar
                      </button>
                      <button
                        onClick={() => handleProviderStatusUpdate(order.id, 'REJECTED')}
                        disabled={updatingOrderId === order.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-medium text-red-400 transition-all hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <XCircle className="h-4 w-4" />
                        Recusar
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="lg:col-span-3 bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">Minhas solicitações recentes</h2>
                <p className="text-sm text-muted-foreground">Pedidos feitos por você</p>
              </div>
              <Link to="/meus-pedidos">
                <button className="text-xs text-primary flex items-center gap-1 hover:text-primary/80 transition-colors font-medium">
                  Ver todos <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            <div className="divide-y divide-border">
              {recentPurchases.length === 0 ? (
                <div className="px-6 py-8 text-sm text-muted-foreground">
                  Você ainda não enviou solicitações de serviço.
                </div>
              ) : recentPurchases.map((order, index) => {
                const status = STATUS_STYLE[order.rawStatus];
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + index * 0.06 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors"
                  >
                    <img src={order.avatar} alt={order.client} className="w-10 h-10 rounded-full border border-border shrink-0 object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{order.client}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.service}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">R$ {order.value.toLocaleString('pt-BR')}</p>
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border mt-1 ${status.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot} ${['PENDING', 'ACCEPTED', 'IN_PROGRESS'].includes(order.rawStatus) ? 'animate-pulse' : ''}`} />
                        {status.label}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 }}
            className="lg:col-span-2 bg-card border border-border rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h2 className="text-lg font-bold">Meus anúncios</h2>
                <p className="text-sm text-muted-foreground">Seus serviços publicados</p>
              </div>
              <Link to="/meus-anuncios">
                <button className="text-xs text-primary flex items-center gap-1 hover:text-primary/80 transition-colors font-medium">
                  Gerenciar <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

            <div className="divide-y divide-border">
              {isLoading ? (
                [...Array(3)].map((_, index) => (
                  <motion.div
                    key={`skeleton-${index}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.38 + index * 0.06 }}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/3 transition-colors group"
                  >
                    <div className="w-12 h-9 rounded-lg bg-border animate-pulse" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="h-3 w-28 rounded-full bg-border/60 animate-pulse" />
                      <div className="h-3 w-20 rounded-full bg-border/40 animate-pulse" />
                    </div>
                    <div className="h-5 w-16 rounded-full bg-border/40 animate-pulse" />
                  </motion.div>
                ))
              ) : (
                listings.slice(0, 5).map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.38 + index * 0.06 }}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/3 transition-colors group"
                  >
                    {service.image ? (
                      <img
                        src={resolveListingImageUrl(service.image, service.id)}
                        alt={service.title}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = resolveListingImageUrl(
                            undefined,
                            service.id,
                          );
                        }}
                        className="w-12 h-9 rounded-lg object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-9 rounded-lg bg-border animate-pulse" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">
                        {service.title ?? 'Serviço'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-muted-foreground">
                          {(service.rating ?? 0).toFixed(1)} · {service.reviewCount ?? service.reviews?.length ?? 0} reviews
                        </span>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-primary shrink-0">
                      {service.price ? `R$ ${service.price.toLocaleString('pt-BR')}` : 'R$ 0'}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44 }}
          className="bg-card border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold mb-5">Ações rápidas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all text-primary border-primary/20 hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                  <action.icon className="w-5 h-5 shrink-0" />
                  {action.label}
                </button>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
