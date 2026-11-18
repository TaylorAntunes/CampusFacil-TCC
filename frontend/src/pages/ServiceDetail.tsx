import { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { advertisementsService, Advertisement } from '../services/advertisements.service';
import {
  serviceRequestsService,
  ServiceRequest,
  ServiceRequestStatus,
} from '../services/service-requests.service';
import { Clock, RefreshCw, CheckCircle2, ChevronRight, Star } from 'lucide-react';
import { NeonButton } from '@/components/NeonButton';
import { StarRating } from '@/components/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { resolveApiAssetUrl } from '@/services/api';

const ACTIVE_PURCHASE_STATUSES: ServiceRequestStatus[] = ['PENDING', 'ACCEPTED', 'IN_PROGRESS'];

function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [advertisement, setAdvertisement] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('Quero reservar este serviço');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [advertisementRequests, setAdvertisementRequests] = useState<ServiceRequest[]>([]);
  const [isCheckingRequest, setIsCheckingRequest] = useState(false);
  const seller = advertisement?.author;
  const isOwner = user?.id === advertisement?.authorId;
  const activePurchase = useMemo(() => {
    if (!user || !advertisementRequests.length) {
      return null;
    }
    return (
      advertisementRequests.find((request) => {
        return (
          request.requesterId === user.id &&
          ACTIVE_PURCHASE_STATUSES.includes(request.status)
        );
      }) ?? null
    );
  }, [advertisementRequests, user]);
  const hasActivePurchase = Boolean(activePurchase);

  const purchaseButtonLabel = useMemo(() => {
    if (isCheckingRequest) return 'Verificando...';
    if (isSubmitting) return 'Enviando...';
    if (!activePurchase) return 'Solicitar serviço';

    if (activePurchase.status === 'PENDING') {
      return 'Aguardando aceite do prestador';
    }
    if (activePurchase.status === 'ACCEPTED') {
      return 'Registrar pagamento combinado';
    }
    return 'Acompanhar solicitação';
  }, [activePurchase, isCheckingRequest, isSubmitting]);

  const purchaseHelpText = useMemo(() => {
    if (!activePurchase) {
      return 'Envie sua solicitação e combine as condições diretamente com o prestador. A plataforma não processa pagamentos.';
    }

    if (activePurchase.status === 'PENDING') {
      return 'Sua solicitação foi enviada. Aguarde a resposta do prestador e utilize as conversas para combinar os detalhes.';
    }

    if (activePurchase.status === 'ACCEPTED') {
      return 'Sua solicitação foi aceita. Em Minhas solicitações, registre a confirmação do pagamento combinado diretamente com o prestador.';
    }

    return 'O serviço está em andamento. Acompanhe a solicitação ou registre sua conclusão em Minhas solicitações.';
  }, [activePurchase]);

  const shouldDisablePurchaseButton =
    isOwner ||
    isSubmitting ||
    isCheckingRequest ||
    activePurchase?.status === 'PENDING';

  const shouldShowScopeField = !hasActivePurchase;

  const handlePurchaseAction = async () => {
    if (activePurchase) {
      navigate('/meus-pedidos');
      return;
    }

    await handleRequestService();
  };

  const loadAdvertisementRequests = async (advertisementId: string) => {
    setIsCheckingRequest(true);
    try {
      const { serviceRequests } = await serviceRequestsService.getAdvertisementServiceRequests(advertisementId);
      setAdvertisementRequests(serviceRequests ?? []);
    } catch (err) {
      console.error('Erro ao verificar solicitações deste serviço:', err);
    } finally {
      setIsCheckingRequest(false);
    }
  };

  useEffect(() => {
    if (!user || !advertisement) {
      setAdvertisementRequests([]);
      setIsCheckingRequest(false);
      return;
    }

    let isMounted = true;
    const run = async () => {
      setIsCheckingRequest(true);
      try {
        const { serviceRequests } = await serviceRequestsService.getAdvertisementServiceRequests(advertisement.id);
        if (!isMounted) return;
        setAdvertisementRequests(serviceRequests ?? []);
      } catch (err) {
        console.error('Erro ao verificar solicitações deste serviço:', err);
      } finally {
        if (isMounted) {
          setIsCheckingRequest(false);
        }
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [advertisement, user]);

  const handleOpenChat = () => {
    if (!seller) return;
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.id === seller.id) {
      addToast('error', 'Voce nao pode iniciar chat com seu proprio perfil.');
      return;
    }
    navigate(`/conversas/${seller.id}`);
  };

  const handleRequestService = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      await serviceRequestsService.create({
        advertisementId: id!,
        message: message || 'Estou interessado neste serviço',
      });
      if (id) {
        await loadAdvertisementRequests(id);
      }
      addToast('success', 'Solicitação enviada com sucesso!');
      setMessage('');
    } catch (err) {
      addToast('error', 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAdvertisement();
    }
  }, [id]);

  const loadAdvertisement = async () => {
    try {
      setIsLoading(true);
      const { advertisement: fetchedAdvertisement } = await advertisementsService.getById(id!);
      setAdvertisement(fetchedAdvertisement);
    } catch (err) {
      addToast('error', 'Erro ao carregar anúncio');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!advertisement) {
    return <div className="min-h-screen flex items-center justify-center">Anúncio não encontrado</div>;
  }

  const formattedReviews = (advertisement.reviews ?? []).map((review) => {
    const reviewer = review.reviewer;
    const avatarUrl = reviewer?.avatar_url
      ? resolveApiAssetUrl(reviewer.avatar_url) ?? reviewer.avatar_url
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewer?.name ?? review.id}`;
    return {
      id: review.id ?? `${reviewer?.id ?? 'review'}-${review.created_at ?? Math.random()}`,
      rating: review.rating,
      comment: review.comment ?? 'Comentário não divulgado.',
      userName: reviewer?.name ?? 'Participante',
      userAvatar: avatarUrl,
      date: review.created_at ? new Date(review.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    };
  });

  const category = advertisement.category;
  const reviewCount = formattedReviews.length;
  const rating = reviewCount > 0 ? formattedReviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount : 0;
  const deliveryTime = advertisement.deliveryTime ?? '7 dias';
  const features = advertisement.features && advertisement.features.length > 0
    ? advertisement.features
    : [
        'Combine as atividades previstas com o prestador',
        'Utilize as conversas para esclarecer dúvidas',
        'Defina os materiais e arquivos a serem entregues',
        'Combine os prazos e as condições do serviço',
      ];
  const imageUrl =
    resolveApiAssetUrl(advertisement.image) ??
    `https://picsum.photos/seed/${advertisement.id}/900/500`;

  if (!seller) {
    return <div className="p-10 text-center text-xl">Serviço indisponível</div>;
  }

  const sellerAvatarUrl = seller.avatar_url
    ? resolveApiAssetUrl(seller.avatar_url) ?? seller.avatar_url
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.name}`;
  const sellerMemberSince = seller.created_at
    ? new Date(seller.created_at).getFullYear()
    : '2022';

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="flex items-center text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-primary transition-colors">Início</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link to={`/explore?category=${category?.id}`} className="hover:text-primary transition-colors">
          {category?.name || 'Categoria'}
        </Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-foreground truncate max-w-xs">{advertisement.title}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{advertisement.title}</h1>
            <div className="flex flex-wrap items-center gap-6">
              {isOwner ? (
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={sellerAvatarUrl} />
                    <AvatarFallback>{seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{seller.name}</div>
                  </div>
                </div>
              ) : (
                <Link to={`/seller/${seller.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={sellerAvatarUrl} />
                    <AvatarFallback>{seller.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{seller.name}</div>
                  </div>
                </Link>
              )}

              <div className="h-10 w-px bg-border hidden sm:block" />

              <StarRating rating={rating} count={reviewCount} />

              <div className="h-10 w-px bg-border hidden sm:block" />

              <div className="text-sm font-medium">
                {reviewCount} pedidos na fila
              </div>
            </div>
          </div>

          <div className="aspect-video rounded-2xl overflow-hidden border border-border">
            <img src={imageUrl} alt={advertisement.title} className="w-full h-full object-cover" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Sobre este serviço</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p className="whitespace-pre-line wrap-break-word">{advertisement.description}</p>
              <p className="whitespace-pre-line">
                Consulte a descrição do anúncio e esclareça suas dúvidas com o prestador.
                As atividades, os prazos e as condições devem ser combinados entre os participantes.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">Detalhes a combinar:</h3>
              <ul className="space-y-2">
                {features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <Separator className="bg-border" />

          <div>
            <h2 className="text-2xl font-bold mb-6">Sobre o prestador</h2>
            <div className="flex flex-col sm:flex-row gap-6 p-6 bg-card rounded-2xl border border-border">
                <Avatar className="h-24 w-24 border-2 border-primary/20">
                  <AvatarImage src={sellerAvatarUrl} />
                  <AvatarFallback>{seller.name[0]}</AvatarFallback>
                </Avatar>
              <div className="flex-1">
                {isOwner ? (
                  <h3 className="text-xl font-bold">{seller.name}</h3>
                ) : (
                  <Link to={`/seller/${seller.id}`}>
                    <h3 className="text-xl font-bold hover:text-primary transition-colors">{seller.name}</h3>
                  </Link>
                )}
                <p className="text-muted-foreground mt-2 mb-4 whitespace-pre-line">{seller.bio ?? 'Este participante ainda não adicionou uma apresentação.'}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-sm text-muted-foreground">Avaliação</div>
                    <div className="font-bold flex items-center mt-1">
                      <Star className="w-4 h-4 text-yellow-400 mr-1 fill-current" /> {rating.toFixed(1)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Contato</div>
                    <div className="font-bold mt-1">{seller.email ?? 'Não informado'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Membro desde</div>
                    <div className="font-bold mt-1">{sellerMemberSince}</div>
                  </div>
                </div>
                <div className="mt-6">
                  <NeonButton
                    variant="outline"
                    size="sm"
                    onClick={handleOpenChat}
                    disabled={isOwner}
                  >
                    Contatar prestador
                  </NeonButton>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Avaliações ({reviewCount})</h2>
              <StarRating rating={rating} showCount={false} className="text-xl" />
            </div>

            <div className="space-y-6">
              {formattedReviews.length > 0 ? (
                formattedReviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.userAvatar} />
                          <AvatarFallback>{review.userName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold">{review.userName}</div>
                          <div className="text-sm text-muted-foreground">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, index) => (
                          <Star key={index} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center rounded-2xl border border-border/50 bg-card/40 p-6 text-muted-foreground">
                  Seja o primeiro a avaliar este serviço e compartilhe a sua experiência.
                </div>
              )}
            </div>
            <div className="mt-8 text-center">
              <NeonButton variant="outline">Ver Mais Avaliações</NeonButton>
            </div>
          </div>
        </div>

        <div className="relative">
          {!isOwner && (
            <div className="sticky top-28 bg-card border border-border p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-2xl font-bold">Solicitação de serviço</h3>
                <div className="text-3xl font-bold text-gradient">
                  R$ {advertisement.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <p className="text-muted-foreground">
                Consulte o valor anunciado e combine o escopo com o prestador. O CampusFácil não processa pagamentos.
              </p>

              <div className="flex items-center gap-6 mb-2 font-medium text-sm">
                <div className="flex items-center text-foreground">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  {deliveryTime}
                </div>
                <div className="flex items-center text-foreground">
                  <RefreshCw className="w-4 h-4 mr-2 text-primary" />
                  Revisões a combinar
                </div>
              </div>

              <ul className="space-y-3 mb-2">
                {features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 mr-3 text-primary shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {shouldShowScopeField && (
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 h-24 rounded-xl border border-border bg-background text-sm"
                  placeholder="Descreva sua necessidade acadêmica e o prazo desejado..."
                />
              )}
              <NeonButton
                className="w-full mb-2 text-lg py-5"
                onClick={handlePurchaseAction}
                disabled={shouldDisablePurchaseButton}
              >
                {purchaseButtonLabel}
              </NeonButton>
              <div className="text-center text-xs text-muted-foreground">
                {purchaseHelpText}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceDetail;
