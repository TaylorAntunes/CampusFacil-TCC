import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  LayoutList,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Star,
  TrendingUp,
  Search,
  Package,
  X,
  ImageIcon,
  DollarSign,
  Tag,
  FileText,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/StarRating';
import { useToast } from '../contexts/ToastContext';
import { advertisementsService, Advertisement, CreateAdvertisementRequest } from '../services/advertisements.service';
import { categoriesService, Category } from '../services/categories.service';
import { resolveApiAssetUrl } from '@/services/api';
import { cn } from '@/lib/utils';

interface EditForm {
  title: string;
  price: string;
  categoryId: string;
  description: string;
  image?: string;
}

interface EditErrors {
  title?: string;
  price?: string;
}

const resolveImageUrl = (image?: string, seed = 'campusfacil'): string =>
  resolveApiAssetUrl(image) ?? `https://picsum.photos/seed/${seed}/600/400`;

const cardVariants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

function ListingSkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
      <Skeleton className="w-full h-44 rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function DeleteModal({
  listing,
  onConfirm,
  onCancel,
}: {
  listing: Advertisement;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5 mx-auto">
          <Trash2 className="w-7 h-7 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-center mb-2">Excluir anúncio?</h3>
        <p className="text-muted-foreground text-center text-sm mb-6">
          Tem certeza que deseja excluir{' '}
          <span className="text-foreground font-medium">"{listing.title}"</span>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
          >
            Excluir
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function EditModal({
  listing,
  categories,
  onSave,
  onCancel,
}: {
  listing: Advertisement;
  categories: Category[];
  onSave: (updated: Partial<Advertisement>) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    title: listing.title,
    price: listing.price.toString().replace('.', ','),
    categoryId: listing.category?.id ?? listing.categoryId,
    description: listing.description ?? '',
    image: listing.image,
  });
  const [errors, setErrors] = useState<EditErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { addToast } = useToast();

  const setField = (field: keyof EditForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const previewImage = useMemo(
    () => resolveImageUrl(form.image ?? listing.image, listing.id),
    [form.image, listing.image, listing.id],
  );

  const fallbackCategory: Category = {
    id: listing.category?.id ?? listing.categoryId,
    name: listing.category?.name ?? 'Categoria',
  };
  const categoryOptions: Category[] = categories.length ? categories : [fallbackCategory];

  const validate = (): boolean => {
    const e: EditErrors = {};
    if (!form.title.trim()) e.title = 'O título é obrigatório.';
    else if (form.title.trim().length < 10) e.title = 'Mínimo de 10 caracteres.';
    const priceValue = parseFloat(form.price.replace(',', '.'));
    if (!form.price) e.price = 'O preço é obrigatório.';
    else if (isNaN(priceValue) || priceValue <= 0) e.price = 'Digite um valor válido.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const payload: Partial<CreateAdvertisementRequest> = {
        title: form.title.trim(),
        price: parseFloat(form.price.replace(',', '.')),
        categoryId: form.categoryId,
      };
      if (form.description.trim()) payload.description = form.description.trim();
      const imageUrl = form.image?.trim();
      if (imageUrl) {
        payload.image = imageUrl;
      }
      await advertisementsService.update(listing.id, payload);
      const updatedFields: Partial<Advertisement> = {
        title: payload.title,
        price: payload.price,
        categoryId: payload.categoryId,
        description: payload.description ?? listing.description,
        image: (payload.image as string) ?? listing.image,
      };
      setSaved(true);
      addToast('success', 'Anúncio atualizado com sucesso');
      setTimeout(() => onSave(updatedFields), 700);
    } catch (error) {
      console.error(error);
      addToast('error', 'Falha ao atualizar o anúncio');
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
        initial={{ scale: 0.94, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-[0_30px_80px_rgba(0,0,0,0.7)] overflow-hidden"
      >
        <div className="relative flex items-center justify-between px-6 py-5 border-b border-border">
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-secondary/50 to-transparent" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Editar Anúncio</h2>
              <p className="text-xs text-muted-foreground">Atualize as informações do seu serviço</p>
            </div>
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

          <div className="relative h-28 overflow-hidden bg-input">
          <img
            src={previewImage}
            alt="preview"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-linear-to-t from-card/70 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="url"
                placeholder="URL da imagem (opcional)"
                value={form.image ?? ''}
                onChange={(e) => setField('image', e.target.value)}
                className="w-full h-9 bg-background/80 backdrop-blur-sm border border-border rounded-lg pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5 max-h-[50vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Título do Serviço
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="Ex.: Design de apresentações acadêmicas"
              className={cn(
                'w-full h-11 bg-input border rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all',
                errors.title
                  ? 'border-red-500/60 focus:ring-2 focus:ring-red-500/20'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
              )}
            />
            {errors.title && <p className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" />{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Preço (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">R$</span>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => setField('price', e.target.value)}
                  placeholder="0,00"
                  className={cn(
                    'w-full h-11 bg-input border rounded-xl pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none transition-all',
                    errors.price
                      ? 'border-red-500/60 focus:ring-2 focus:ring-red-500/20'
                      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                  )}
                />
              </div>
              {errors.price && <p className="text-xs text-red-400 flex items-center gap-1"><X className="w-3 h-3" />{errors.price}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Categoria
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setField('categoryId', e.target.value)}
                className="w-full h-11 bg-input border border-border rounded-xl px-3 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              >
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Descrição <span className="text-muted-foreground/50 normal-case font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Descreva o serviço, as atividades previstas e o que será entregue..."
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center gap-3 bg-background/40">
          <button
            onClick={onCancel}
            className="flex-1 h-11 rounded-xl border border-border text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all',
              saved
                ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                : 'bg-secondary text-white hover:bg-secondary/90 shadow-[0_0_20px_rgba(123,47,255,0.4)] hover:shadow-[0_0_30px_rgba(123,47,255,0.6)] disabled:opacity-70'
            )}
          >
            {saved ? (
              <><CheckCircle className="w-4 h-4" /> Salvo!</>
            ) : isSaving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Salvar Alterações</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MyAdvertisementsPage() {
  const [listings, setListings] = useState<Advertisement[]>([]);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editTarget, setEditTarget] = useState<Advertisement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadAdvertisements = async () => {
      try {
        setIsLoading(true);
        const { advertisements } = await advertisementsService.getUserAdvertisements();
        if (isMounted) {
          setListings(advertisements);
        }
      } catch (error) {
        console.error(error);
        addToast('error', 'Não foi possível carregar seus anúncios');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAdvertisements();

    return () => {
      isMounted = false;
    };
  }, [addToast]);

  useEffect(() => {
    let isMounted = true;
    categoriesService.getAll().then((data) => {
      if (isMounted) setCategories(data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (listing: Advertisement) => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await advertisementsService.delete(listing.id);
      setListings((prev) => prev.filter((item) => item.id !== listing.id));
      addToast('success', 'Anúncio excluído com sucesso');
    } catch (error) {
      console.error(error);
      addToast('error', 'Falha ao excluir o anúncio');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEditSave = (listingId: string, updated: Partial<Advertisement>) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId ? { ...item, ...updated } : item
      )
    );
    setEditTarget(null);
  };

  const filteredListings = useMemo(() => {
    return listings.filter((listing) =>
      listing.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [listings, search]);

  const totalSales = listings.reduce(
    (acc, listing) => acc + (listing.reviews?.length ?? 0),
    0
  );
  const avgRating =
    listings.length > 0
      ? (
          listings.reduce((acc, listing) => {
            const reviews = listing.reviews?.length ?? 0;
            const ratingSum = (listing.reviews ?? []).reduce((sum, review) => sum + review.rating, 0);
            return acc + (reviews > 0 ? ratingSum / reviews : 0);
          }, 0) / listings.length
        ).toFixed(1)
      : '—';

  const formatRating = (listing: Advertisement) => {
    const reviews = listing.reviews ?? [];
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  };

  const formatReviewCount = (listing: Advertisement) => listing.reviews?.length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative border-b border-border bg-card/30 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-secondary/5 via-transparent to-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-center gap-6 justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shadow-[0_0_20px_rgba(123,47,255,0.15)]">
                <LayoutList className="w-7 h-7 text-secondary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Meus <span className="text-gradient">Anúncios</span>
                </h1>
                <p className="text-muted-foreground mt-1">Gerencie os serviços que você oferece à comunidade acadêmica.</p>
              </div>
            </div>

            <Link
              to="/novo-anuncio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] transition-all"
            >
              <Plus className="w-5 h-5" />
              Criar novo anúncio
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-3 gap-4 mt-10"
          >
            {[
              { label: 'Anúncios ativos', value: listings.length, icon: Package },
              { label: 'Avaliações recebidas', value: totalSales, icon: TrendingUp },
              { label: 'Avaliação média', value: avgRating, icon: Star },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-background/60 border border-border rounded-xl px-5 py-4 flex items-center gap-4">
                <Icon className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xl font-bold">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar anúncio..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              data-testid="input-search-listings"
              className="w-full h-10 bg-input border border-border rounded-lg pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredListings.length} anúncio{filteredListings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ListingSkeletonCard key={index} />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mb-6">
              <LayoutList className="w-10 h-10 text-muted-foreground/40" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-muted-foreground mb-8 max-w-sm">
              {search
                ? 'Nenhum anúncio corresponde à sua busca.'
                : 'Você ainda não criou nenhum anúncio. Comece agora!'}
            </p>
            <Link
              to="/novo-anuncio"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all"
            >
              <Plus className="w-5 h-5" />
              Criar primeiro anúncio
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredListings.map((listing) => (
                <motion.div
                  key={listing.id}
                  variants={cardVariants}
                  layout
                  exit="exit"
                  data-testid={`card-listing-${listing.id}`}
                  className="group bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:border-primary/30 transition-all hover:shadow-[0_0_30px_rgba(0,212,255,0.08)] neon-border"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={resolveImageUrl(listing.image, listing.id)}
                      alt={listing.title}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = resolveImageUrl(undefined, listing.id);
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-background/80 backdrop-blur-sm border border-border rounded-full text-xs font-medium text-muted-foreground">
                      {listing.category?.name ?? listing.categoryId}
                    </span>
                  </div>

                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {listing.title}
                    </h3>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <StarRating rating={formatRating(listing)} showCount={false} />
                        <span className="text-muted-foreground text-xs">({formatReviewCount(listing)})</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {formatReviewCount(listing)} avaliações
                      </div>
                    </div>

                    <div className="text-lg font-bold text-primary">
                      R$ {listing.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>

                    <div className="mt-auto pt-3 border-t border-border/60 flex gap-2">
                      <Link to={`/service/${listing.id}`} className="flex-1">
                        <button
                          data-testid={`button-view-listing-${listing.id}`}
                          title="Visualizar"
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border text-xs font-medium hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                        >
                          <Eye className="w-4 h-4" />
                          Visualizar
                        </button>
                      </Link>
                      <button
                        data-testid={`button-edit-listing-${listing.id}`}
                        title="Editar"
                        onClick={() => setEditTarget(listing)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-border text-xs font-medium hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        data-testid={`button-delete-listing-${listing.id}`}
                        title="Excluir"
                        onClick={() => setDeleteTarget(listing)}
                        className="flex items-center justify-center px-3 py-2 rounded-lg bg-white/5 border border-border text-xs font-medium hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            listing={deleteTarget}
            onConfirm={() => handleDelete(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editTarget && (
          <EditModal
            listing={editTarget}
            categories={categories}
            onSave={(updated) => handleEditSave(editTarget.id, updated)}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
