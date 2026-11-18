import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Filter,
  Loader2,
  MessageSquare,
  Search,
  ShoppingBag,
  Star,
  ThumbsUp,
  X,
  XCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  serviceRequestsService,
  ServiceRequest,
  ServiceRequestStatus,
} from '../services/service-requests.service';
import { Review, reviewsService } from '../services/reviews.service';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { isAxiosError } from 'axios';

type OrderState = 'em-andamento' | 'concluido' | 'cancelado';
type OrderFilter = 'all' | OrderState;
type OrderAction = 'pago' | 'concluido' | 'cancelado';

interface Order {
  id: string;
  serviceName: string;
  image?: string;
  price: number;
  status: OrderState;
  rawStatus: ServiceRequestStatus;
  date: string;
  serviceId?: string;
  sellerName: string;
  sellerAvatar: string;
  rated?: boolean;
  rating?: number;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api').replace(/\/api\/?$/, '') || 'http://localhost:3333';

const STATUS_CONFIG: Record<ServiceRequestStatus, { label: string; icon: typeof Clock; classes: string; dot: string }> = {
  PENDING: {
    label: 'Aguardando aceite',
    icon: Clock,
    classes: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  ACCEPTED: {
    label: 'Aguardando pagamento',
    icon: Clock,
    classes: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    dot: 'bg-blue-400',
  },
  IN_PROGRESS: {
    label: 'Em andamento',
    icon: Clock,
    classes: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    dot: 'bg-yellow-400',
  },
  COMPLETED: {
    label: 'Concluído',
    icon: CheckCircle,
    classes: 'text-green-400 bg-green-400/10 border-green-400/20',
    dot: 'bg-green-400',
  },
  REJECTED: {
    label: 'Recusado',
    icon: XCircle,
    classes: 'text-red-400 bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
  },
  CANCELLED: {
    label: 'Cancelado',
    icon: XCircle,
    classes: 'text-red-400 bg-red-400/10 border-red-400/20',
    dot: 'bg-red-400',
  },
};

const FILTER_TABS: { value: OrderFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'em-andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluídos' },
  { value: 'cancelado', label: 'Cancelados' },
];

const STAR_LABELS = ['', 'Horrível', 'Ruim', 'Regular', 'Bom', 'Excelente!'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const statusMap: Record<ServiceRequestStatus, OrderState> = {
  PENDING: 'em-andamento',
  ACCEPTED: 'em-andamento',
  IN_PROGRESS: 'em-andamento',
  COMPLETED: 'concluido',
  REJECTED: 'cancelado',
  CANCELLED: 'cancelado',
};

const formatImageUrl = (image?: string) =>
  image
    ? image.startsWith('http')
      ? image
      : `${API_BASE_URL}${image}`
    : `https://picsum.photos/seed/service-${Math.random()}/600/400`;

const getAvatarUrl = (avatar?: string, seed?: string) =>
  avatar
    ? avatar.startsWith('http')
      ? avatar
      : `${API_BASE_URL}${avatar}`
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed ?? 'seller')}`;

function OrderSkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row">
      <Skeleton className="w-full md:w-48 h-40 md:h-auto rounded-none" />
      <div className="flex-1 p-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="mt-auto flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ action, order, onConfirm, onCancel }: {
  action: OrderAction;
  order: Order;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isPayment = action === 'pago';
  const isConclude = action === 'concluido';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
      >
        <div
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto border',
            isPayment
              ? 'bg-primary/10 border-primary/20'
              : isConclude
              ? 'bg-green-400/10 border-green-400/20'
              : 'bg-red-400/10 border-red-400/20'
          )}
        >
          {isPayment ? (
            <ShoppingBag className="w-7 h-7 text-primary" />
          ) : isConclude ? (
            <CheckCircle className="w-7 h-7 text-green-400" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-red-400" />
          )}
        </div>

        <h3 className="text-xl font-bold text-center mb-2">
          {isPayment ? 'Registrar confirmação de pagamento?' : isConclude ? 'Marcar como concluído?' : 'Cancelar pedido?'}
        </h3>
        <p className="text-muted-foreground text-center text-sm mb-6 leading-relaxed">
          {isPayment ? (
            <>
              Ao confirmar o pagamento combinado diretamente com o prestador para{' '}
              <span className="text-foreground font-medium">"{order.serviceName}"</span>, você registrará essa informação. A plataforma não processa pagamentos. A
              solicitação passará para <span className="text-foreground font-medium">em andamento</span>.
            </>
          ) : isConclude ? (
            <>
              Confirma que o serviço{' '}
              <span className="text-foreground font-medium">"{order.serviceName}"</span> foi entregue com
              sucesso?
            </>
          ) : (
            <>
              Tem certeza que deseja cancelar{' '}
              <span className="text-foreground font-medium">"{order.serviceName}"</span>? Esta ação não pode ser
              desfeita.
            </>
          )}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Voltar
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all',
              isPayment
                ? 'bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.3)]'
                : isConclude
                ? 'bg-green-500 hover:bg-green-600 shadow-[0_0_15px_rgba(74,222,128,0.3)]'
                : 'bg-red-500 hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
            )}
          >
            {isPayment ? 'Registrar e iniciar' : isConclude ? 'Confirmar' : 'Cancelar pedido'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StarRatingInput({
  value,
  hovered,
  onHover,
  onLeave,
  onChange,
}: {
  value: number;
  hovered: number;
  onHover: (v: number) => void;
  onLeave: () => void;
  onChange: (v: number) => void;
}) {
  const active = hovered || value;
  return (
    <div className="flex items-center gap-2" onMouseLeave={onLeave}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.button
          key={i}
          type="button"
          onMouseEnter={() => onHover(i)}
          onClick={() => onChange(i)}
          whileHover={{ scale: 1.25 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            scale: i <= active ? 1.1 : 1,
            rotate: i === active && value === i ? [0, -12, 12, -6, 6, 0] : 0,
          }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 400 }}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              'w-9 h-9 transition-colors duration-150',
              i <= active
                ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.7)]'
                : 'text-muted-foreground/30'
            )}
          />
        </motion.button>
      ))}
    </div>
  );
}

function ReviewModal({
  order,
  onSubmit,
  onCancel,
}: {
  order: Order;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!rating || isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(rating, comment.trim());
      setDone(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      onCancel();
    } catch (err) {
      console.error(err);
      setError('Não foi possível enviar a avaliação. Tente novamente');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-yellow-400/50 to-transparent" />
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Avaliar Serviço</h2>
              <p className="text-xs text-muted-foreground">Sua avaliação contribui para a comunidade acadêmica.</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-6 py-6 flex flex-col gap-6">
          <div className="flex items-center gap-3 p-4 bg-background/60 rounded-xl border border-border">
            <img
              src={formatImageUrl(order.image)}
              alt={order.serviceName}
              className="w-14 h-10 rounded-lg object-cover border border-border shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{order.serviceName}</p>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={order.sellerAvatar}
                  alt={order.sellerName}
                  className="w-5 h-5 rounded-full border border-border"
                />
                <p className="text-xs text-muted-foreground">por {order.sellerName}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm font-semibold text-muted-foreground">
              {hovered || rating ? (
                <span className="text-yellow-400 font-bold text-base">{STAR_LABELS[hovered || rating]}</span>
              ) : (
                'Toque nas estrelas para avaliar'
              )}
            </p>
            <StarRatingInput
              value={rating}
              hovered={hovered}
              onHover={setHovered}
              onLeave={() => setHovered(0)}
              onChange={setRating}
            />
            {!rating && <p className="text-xs text-muted-foreground/60">Selecione uma nota para continuar</p>}
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" /> Comentário{' '}
              <span className="normal-case font-normal text-muted-foreground/50">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="Descreva sua experiência com o serviço..."
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/15 transition-all resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition-colors"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!rating || isSaving || done}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
              done
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : rating
                  ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] disabled:opacity-70'
                  : 'bg-white/5 border border-border text-muted-foreground cursor-not-allowed'
            )}
          >
            {done ? (
              <>
                <CheckCircle className="w-4 h-4" /> Avaliado!
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <ThumbsUp className="w-4 h-4" /> Enviar avaliação
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyServiceRequestsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<OrderFilter>('all');
  const [search, setSearch] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ orderId: string; action: OrderAction } | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [requestsResponse, reviewsResponse] = await Promise.all([
          serviceRequestsService.getUserServiceRequests(),
          reviewsService.getUserReviews(),
        ]);
        if (!isMounted) return;
        setServiceRequests(requestsResponse.serviceRequests);
        setUserReviews(reviewsResponse.reviews);
      } catch (error) {
        console.error(error);
        addToast('error', 'Erro ao carregar pedidos');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [addToast, navigate, user]);

  const reloadOrders = async () => {
    const [requestsResponse, reviewsResponse] = await Promise.all([
      serviceRequestsService.getUserServiceRequests(),
      reviewsService.getUserReviews(),
    ]);
    setServiceRequests(requestsResponse.serviceRequests);
    setUserReviews(reviewsResponse.reviews);
  };

  const filteredServiceRequests = useMemo(() => {
    if (!user) return [];
    return serviceRequests.filter((request) => request.requesterId === user.id);
  }, [serviceRequests, user]);

  const reviewsByAdvertisement = useMemo(() => {
    return userReviews.reduce<Record<string, Review>>((acc, review) => {
      acc[review.advertisementId] = review;
      return acc;
    }, {});
  }, [userReviews]);

  const orders = useMemo(() => {
    return filteredServiceRequests.map((request) => {
      const advertisement = request.advertisement;
      const advertId = advertisement?.id;
      const review = advertId ? reviewsByAdvertisement[advertId] : undefined;

      return {
        id: request.id,
        serviceName: advertisement?.title ?? 'Serviço removido',
        image: advertisement?.image,
        price: advertisement?.price ? Number(advertisement.price) : 0,
        status: statusMap[request.status],
        rawStatus: request.status,
        date: new Date(request.createdAt).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        serviceId: advertId,
        sellerName: advertisement?.author?.name ?? 'Prestador',
        sellerAvatar: getAvatarUrl(advertisement?.author?.avatar_url, advertisement?.author?.name),
        rated: Boolean(review),
        rating: review?.rating,
      };
    });
  }, [filteredServiceRequests, reviewsByAdvertisement]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeStatus === 'all' || order.status === activeStatus;
      const matchesSearch = order.serviceName.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, activeStatus, search]);

  const totalOrdersText = `${filteredOrders.length} pedido${filteredOrders.length !== 1 ? 's' : ''}`;

  const confirmOrder = confirmModal ? orders.find((order) => order.id === confirmModal.orderId) : null;

  const handleStatusUpdate = async (orderId: string, action: OrderAction) => {
    const targetStatus: ServiceRequestStatus =
      action === 'pago' ? 'IN_PROGRESS' : action === 'concluido' ? 'COMPLETED' : 'CANCELLED';

    try {
      const { serviceRequest } = await serviceRequestsService.updateStatus(orderId, targetStatus);
      setServiceRequests((prev) =>
        prev.map((request) => (request.id === serviceRequest.id ? serviceRequest : request)),
      );
      addToast(
        'success',
        action === 'pago'
          ? 'Confirmação registrada e serviço iniciado'
          : action === 'concluido'
            ? 'Pedido marcado como concluído'
            : 'Pedido cancelado com sucesso',
      );
    } catch (error) {
      console.error(error);
      await reloadOrders();
      const message = isAxiosError(error)
        ? error.response?.data?.message ?? 'Não foi possível atualizar o status'
        : 'Não foi possível atualizar o status';
      addToast('error', message);
    } finally {
      setConfirmModal(null);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    const serviceId = reviewTarget?.serviceId;
    if (!serviceId) {
      addToast('error', 'Serviço indisponível para avaliação');
      throw new Error('Serviço inválido');
    }

    try {
      await reviewsService.create({
        advertisementId: serviceId,
        rating,
        comment: comment || undefined,
      });

      addToast('success', 'Avaliação enviada com sucesso');

      const tempId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `tmp-${Date.now()}`;

      setUserReviews((prev) => [
        ...prev.filter((review) => review.advertisementId !== serviceId),
        {
          id: tempId,
          rating,
          comment: comment || undefined,
          advertisementId: serviceId,
          userId: user?.id ?? '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error(error);
      addToast('error', 'Não foi possível enviar a avaliação. Tente novamente');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b bbg-linear-to-rcard/30 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.15)]">
              <ShoppingBag className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Minhas <span className="text-gradient">solicitações</span>
              </h1>
              <p className="text-muted-foreground mt-1">Acompanhe os serviços que você solicitou à comunidade acadêmica.</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveStatus(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeStatus === tab.value
                    ? 'bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,212,255,0.4)]'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pedido..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full h-10 bg-input border border-border rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="text-sm text-muted-foreground ml-auto hidden sm:flex items-center gap-1">
            <Filter className="w-4 h-4" />
            {totalOrdersText}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, index) => (
              <OrderSkeletonCard key={index} />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {activeStatus !== 'all'
                ? 'Não há pedidos com esse status ainda.'
                : 'Você ainda não realizou nenhum pedido. Explore os serviços disponíveis!'}
            </p>
            <Link to="/explore">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all">
                Explorar serviços
              </button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="flex flex-col gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order) => {
                const status = STATUS_CONFIG[order.rawStatus];
                const StatusIcon = status.icon;
                const isAwaitingAcceptance = order.rawStatus === 'PENDING';
                const isAwaitingPayment = order.rawStatus === 'ACCEPTED';
                const isInProgress = order.rawStatus === 'IN_PROGRESS';
                const isDone = order.rawStatus === 'COMPLETED';

                return (
                  <motion.div
                    key={order.id}
                    variants={cardVariants}
                    layout
                    exit="exit"
                    className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col md:flex-row hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.08)]"
                  >
                    <div className="relative w-full md:w-52 h-44 md:h-auto shrink-0 overflow-hidden">
                      <img
                        src={formatImageUrl(order.image)}
                        alt={order.serviceName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-transparent to-card/60 hidden md:block" />
                    </div>
                    <div className="flex-1 p-6 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="text-base font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {order.serviceName}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">Prestador: {order.sellerName}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap ${status.classes}`}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              status.dot,
                              (isAwaitingAcceptance || isAwaitingPayment || isInProgress) && 'animate-pulse',
                            )}
                          />
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </div>

                      {isDone && order.rated && order.rating && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-1.5"
                        >
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={cn(
                                'w-4 h-4',
                                i <= Number(order.rating)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground/30',
                              )}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">Avaliado por você</span>
                        </motion.div>
                      )}

                      <div className="mt-auto flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span>
                            Solicitado em <span className="text-foreground font-medium">{order.date}</span>
                          </span>
                          <span className="text-lg font-bold text-primary">
                            R$ {order.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {isAwaitingAcceptance && (
                            <button
                              onClick={() => setConfirmModal({ orderId: order.id, action: 'cancelado' })}
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-medium hover:bg-red-400/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancelar
                            </button>
                          )}

                          {isAwaitingPayment && (
                            <>
                              <button
                                onClick={() => setConfirmModal({ orderId: order.id, action: 'pago' })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 hover:shadow-[0_0_12px_rgba(0,212,255,0.25)] transition-all"
                              >
                                <ShoppingBag className="w-4 h-4" />
                                Registrar e iniciar
                              </button>
                              <button
                                onClick={() => setConfirmModal({ orderId: order.id, action: 'cancelado' })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-medium hover:bg-red-400/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancelar
                              </button>
                            </>
                          )}

                          {isInProgress && (
                            <>
                              <button
                                onClick={() => setConfirmModal({ orderId: order.id, action: 'concluido' })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-400/10 border border-green-400/20 text-green-400 text-sm font-medium hover:bg-green-400/20 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)] transition-all"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Concluir
                              </button>
                              <button
                                onClick={() => setConfirmModal({ orderId: order.id, action: 'cancelado' })}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-400/10 border border-red-400/20 text-red-400 text-sm font-medium hover:bg-red-400/20 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all"
                              >
                                <XCircle className="w-4 h-4" />
                                Cancelar
                              </button>
                            </>
                          )}

                          {isDone && (
                            order.rated ? (
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium">
                                <Star className="w-4 h-4 fill-yellow-400" />
                                Avaliado
                              </span>
                            ) : (
                              <button
                                onClick={() => setReviewTarget(order)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium hover:bg-yellow-400/20 hover:shadow-[0_0_12px_rgba(250,204,21,0.3)] transition-all"
                              >
                                <Star className="w-4 h-4" />
                                Avaliar
                              </button>
                            )
                          )}

                          {order.serviceId ? (
                            <Link to={`/service/${order.serviceId}`}>
                              <button
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 hover:shadow-[0_0_15px_rgba(0,212,255,0.3)] transition-all"
                              >
                                <Eye className="w-4 h-4" />
                                Ver detalhes
                              </button>
                            </Link>
                          ) : (
                            <button
                              disabled
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted-foreground/10 border border-muted-foreground/20 text-muted-foreground text-sm font-medium cursor-not-allowed"
                            >
                              <Eye className="w-4 h-4" />
                              Serviço indisponível
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {confirmModal && confirmOrder && (
          <ConfirmModal
            action={confirmModal.action}
            order={confirmOrder}
            onConfirm={() => handleStatusUpdate(confirmModal.orderId, confirmModal.action)}
            onCancel={() => setConfirmModal(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {reviewTarget && (
          <ReviewModal
            order={reviewTarget}
            onSubmit={(rating, comment) => handleReviewSubmit(rating, comment)}
            onCancel={() => setReviewTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
