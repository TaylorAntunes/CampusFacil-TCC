import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MapPin,
  User,
  Mail,
  ShieldCheck,
  Edit2,
  X,
  Loader2,
  CheckCircle,
  Plus,
  Camera,
} from 'lucide-react';
import { ServiceCard } from '@/components/ServiceCard';
import { NeonButton } from '@/components/NeonButton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/StarRating';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Advertisement } from '@/services/advertisements.service';
import { authService } from '@/services/auth.service';
import { resolveApiAssetUrl } from '@/services/api';
import {
  sellersService,
  SellerProfile as SellerProfileData,
} from '@/services/sellers.service';

interface EditableProfileData {
  name: string;
  bio: string;
  avatar_url: string;
  location: string;
  response_time: string;
  skills: string[];
}

function deriveSkills(services: Advertisement[], explicitSkills?: string[]) {
  if (explicitSkills && explicitSkills.length > 0) {
    return explicitSkills;
  }

  const derived = new Set<string>();

  services.forEach((service) => {
    if (service.category?.name) {
      derived.add(service.category.name);
    }

    service.features?.forEach((feature) => {
      if (feature.trim()) {
        derived.add(feature.trim());
      }
    });
  });

  if (derived.size === 0) {
    ['Atendimento personalizado', 'Projetos sob medida', 'Entrega digital'].forEach((skill) =>
      derived.add(skill),
    );
  }

  return Array.from(derived).slice(0, 6);
}

function EditProfileModal({
  profile,
  onSave,
  onCancel,
  onAvatarUpload,
}: {
  profile: EditableProfileData;
  onSave: (updated: EditableProfileData) => Promise<void>;
  onCancel: () => void;
  onAvatarUpload: (file: File) => Promise<string>;
}) {
  const maxAvatarSizeBytes = 10 * 1024 * 1024;
  const [form, setForm] = useState<EditableProfileData>({ ...profile });
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<{ name?: string; bio?: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setField = <K extends keyof EditableProfileData>(
    key: K,
    value: EditableProfileData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const addSkill = () => {
    const nextSkill = skillInput.trim();

    if (!nextSkill || form.skills.includes(nextSkill)) {
      setSkillInput('');
      return;
    }

    setField('skills', [...form.skills, nextSkill]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setField(
      'skills',
      form.skills.filter((currentSkill) => currentSkill !== skill),
    );
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'O nome e obrigatorio.';
    } else if (form.name.trim().length < 3) {
      nextErrors.name = 'Minimo de 3 caracteres.';
    }

    if (!form.bio.trim()) {
      nextErrors.bio = 'A bio e obrigatoria.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        bio: form.bio.trim(),
        avatar_url: form.avatar_url.trim(),
        location: form.location.trim(),
        response_time: form.response_time.trim(),
        skills: form.skills,
      });
      setSaved(true);
      window.setTimeout(() => {
        onCancel();
      }, 600);
    } finally {
      setIsSaving(false);
    }
  };

  const previewAvatar =
    avatarPreviewUrl ??
    resolveApiAssetUrl(form.avatar_url) ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(form.name || 'seller')}`;

  const handleAvatarFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Escolha um arquivo de imagem valido.');
      event.target.value = '';
      return;
    }

    if (file.size > maxAvatarSizeBytes) {
      setAvatarError('A imagem excede o limite de 10 MB.');
      event.target.value = '';
      return;
    }

    setAvatarError(null);

    const nextPreviewUrl = URL.createObjectURL(file);
    setAvatarPreviewUrl((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }
      return nextPreviewUrl;
    });

    setIsUploadingAvatar(true);

    try {
      const uploadedAvatarUrl = await onAvatarUpload(file);
      setField('avatar_url', uploadedAvatarUrl);
    } catch (error) {
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'Nao foi possivel enviar a foto de perfil.'
        : 'Nao foi possivel enviar a foto de perfil.';
      setAvatarError(message);
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 18 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(event) => event.stopPropagation()}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_rgba(0,0,0,0.7)]"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Edit2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold">Editar perfil</h2>
              <p className="text-xs text-muted-foreground">
                Atualize os dados públicos do seu perfil na comunidade acadêmica.
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={previewAvatar}
                alt="avatar"
                className="h-20 w-20 rounded-2xl border-2 border-primary/20 object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/20 disabled:opacity-60"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
              <div className="flex items-center justify-between gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Foto de perfil
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="text-xs font-semibold text-primary transition-opacity hover:opacity-80 disabled:opacity-60"
                >
                  {isUploadingAvatar ? 'Enviando...' : 'Escolher imagem'}
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground/70">
                Escolha uma imagem do computador. Limite de 10 MB.
              </p>
              {avatarError ? <p className="text-xs text-red-400">{avatarError}</p> : null}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              Nome completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Seu nome completo"
              className={cn(
                'h-11 w-full rounded-xl border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none',
                errors.name
                  ? 'border-red-500/60 focus:ring-2 focus:ring-red-500/20'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
              )}
            />
            {errors.name ? <p className="text-xs text-red-400">{errors.name}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Edit2 className="h-3.5 w-3.5" />
              Sobre mim
            </label>
            <textarea
              rows={4}
              value={form.bio}
              onChange={(event) => setField('bio', event.target.value)}
              placeholder="Apresente suas habilidades e experiências no contexto acadêmico..."
              className={cn(
                'w-full resize-none rounded-xl border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:outline-none',
                errors.bio
                  ? 'border-red-500/60 focus:ring-2 focus:ring-red-500/20'
                  : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
              )}
            />
            {errors.bio ? <p className="text-xs text-red-400">{errors.bio}</p> : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Localidade
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                placeholder="Ex: Sao Paulo, BR"
                className="h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Tempo de resposta
              </label>
              <input
                type="text"
                value={form.response_time}
                onChange={(event) => setField('response_time', event.target.value)}
                placeholder="Ex: 1 hora"
                className="h-11 w-full rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Habilidades
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(event) => setSkillInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Nova habilidade"
                className="h-10 flex-1 rounded-xl border border-border bg-input px-4 text-sm text-foreground placeholder:text-muted-foreground/50 transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={addSkill}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-all hover:bg-primary/20"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="flex min-h-[32px] flex-wrap gap-2">
              <AnimatePresence>
                {form.skills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-sm transition-colors hover:border-red-400/30"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-muted-foreground transition-colors hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border bg-background/40 px-6 py-4">
          <button
            onClick={onCancel}
            className="h-11 flex-1 rounded-xl border border-border text-sm font-medium transition-colors hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || saved}
            className={cn(
              'flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all',
              saved
                ? 'border border-green-500/30 bg-green-500/20 text-green-400'
                : 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] disabled:opacity-70',
            )}
          >
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Salvo!
              </>
            ) : isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Salvar alteracoes
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const SkeletonProfile = () => (
  <div className="bg-card rounded-2xl border border-border p-6 text-center">
    <div className="space-y-6">
      <Skeleton className="mx-auto h-32 w-32 rounded-full" />
      <Skeleton className="mx-auto h-6 w-40" />
      <Skeleton className="mx-auto h-4 w-32" />
      <Skeleton className="mx-auto h-4 w-24" />
      <div className="space-y-3">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-4 w-28" />
        <Skeleton className="mx-auto h-4 w-24" />
      </div>
    </div>
  </div>
);

export default function SellerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [seller, setSeller] = useState<SellerProfileData | null>(null);
  const [services, setServices] = useState<Advertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const loadSeller = async () => {
      try {
        setIsLoading(true);
        const response = await sellersService.getById(id);
        if (!isMounted) return;
        setSeller(response.seller);
        setServices(response.advertisements);
      } catch (error) {
        console.error(error);
        addToast('error', 'Não foi possível encontrar este prestador.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadSeller();

    return () => {
      isMounted = false;
    };
  }, [addToast, id]);

  const reviewPool = useMemo(
    () => services.flatMap((service) => service.reviews ?? []),
    [services],
  );

  const averageRating = useMemo(() => {
    if (reviewPool.length === 0) return 0;
    const sum = reviewPool.reduce((total, review) => total + review.rating, 0);
    return Number((sum / reviewPool.length).toFixed(1));
  }, [reviewPool]);

  const totalReviews = reviewPool.length;
  const isOwner = user?.id === seller?.id;
  const sellerSkills = useMemo(
    () => deriveSkills(services, seller?.skills),
    [seller?.skills, services],
  );

  const sellerAvatar =
    resolveApiAssetUrl(seller?.avatar_url) ??
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seller?.name ?? 'seller')}`;

  const memberSince = seller?.created_at
    ? new Date(seller.created_at).getFullYear()
    : '—';

  const sellerCard = seller
    ? {
        id: seller.id,
        name: seller.name,
        avatar_url: seller.avatar_url,
      }
    : null;

  const editableProfile = seller
    ? {
        name: seller.name,
        bio: seller.bio ?? '',
        avatar_url: seller.avatar_url ?? '',
        location: seller.location ?? '',
        response_time: seller.response_time ?? '',
        skills: seller.skills ?? [],
      }
    : null;

  const handleOpenChat = () => {
    if (seller?.id && user?.id === seller.id) {
      addToast('error', 'Voce nao pode iniciar chat com seu proprio perfil.');
      return;
    }

    if (!seller?.id) return;
    navigate(`/conversas/${seller.id}`);
  };

  const handleProfileSave = async (updated: EditableProfileData) => {
    if (!seller) return;

    try {
      const updatedUser = await authService.updateUserProfile(updated);
      updateUser(updatedUser);
      setSeller((current) =>
        current
          ? {
              ...current,
              name: updatedUser.name,
              bio: updatedUser.bio,
              avatar_url: updatedUser.avatar_url ?? updatedUser.avatarUrl,
              location: updatedUser.location,
              response_time: updatedUser.response_time,
              skills: updatedUser.skills ?? [],
            }
          : current,
      );
      addToast('success', 'Perfil atualizado com sucesso.');
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'Nao foi possivel atualizar o perfil.'
        : 'Nao foi possivel atualizar o perfil.';
      addToast('error', message);
      throw error;
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const updatedUser = await authService.uploadAvatar(file);
      updateUser(updatedUser);

      const nextAvatarUrl = updatedUser.avatar_url ?? updatedUser.avatarUrl ?? '';

      setSeller((current) =>
        current
          ? {
              ...current,
              avatar_url: nextAvatarUrl,
            }
          : current,
      );

      addToast('success', 'Foto de perfil atualizada com sucesso.');
      return nextAvatarUrl;
    } catch (error) {
      console.error(error);
      const message = axios.isAxiosError<{ message?: string }>(error)
        ? error.response?.data?.message || 'Nao foi possivel enviar a foto de perfil.'
        : 'Nao foi possivel enviar a foto de perfil.';
      addToast('error', message);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 lg:grid-cols-4">
            <SkeletonProfile />
            <div className="space-y-6 lg:col-span-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} className="h-80 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller || !sellerCard || !editableProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg text-muted-foreground">Prestador não encontrado</p>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <div className="relative mb-4 inline-block">
                <Avatar className="h-32 w-32 border-4 border-background ring-2 ring-primary/20">
                  <AvatarImage src={sellerAvatar} />
                  <AvatarFallback>{seller.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div
                  className="absolute bottom-1 right-1 h-6 w-6 rounded-full border-2 border-background bg-green-500"
                  title="Online agora"
                />
              </div>

              <h1 className="mb-1 text-2xl font-bold">{seller.name}</h1>

              <div className="mb-3 flex items-center justify-center text-sm text-primary">
                <ShieldCheck className="mr-1 h-4 w-4" />
                Perfil publico ativo
              </div>

              <StarRating
                rating={averageRating}
                count={totalReviews}
                className="justify-center mb-6"
              />

              <NeonButton
                className="mb-3 w-full"
                onClick={handleOpenChat}
                disabled={isOwner}
              >
                Contatar
              </NeonButton>

              {isOwner ? (
                <button
                  onClick={() => setIsEditOpen(true)}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-white/5 hover:text-foreground"
                >
                  <Edit2 className="h-4 w-4" />
                  Editar perfil
                </button>
              ) : null}

              <div className="mt-8 space-y-4 border-t border-border/50 pt-6">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    De
                  </span>
                  <span className="font-semibold">{seller.location?.trim() || 'Brasil'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <User className="mr-2 h-4 w-4" />
                    Membro desde
                  </span>
                  <span className="font-semibold">{memberSince}</span>
                </div>
                <div className="flex justify-between gap-4 text-sm">
                  <span className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    T. de resposta
                  </span>
                  <span className="truncate font-semibold">
                    {seller.response_time?.trim() || 'Nao informado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-bold">Sobre mim</h3>
              <p className="leading-relaxed text-muted-foreground">
                {seller.bio?.trim() || 'Este participante ainda não adicionou uma apresentação.'}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 text-lg font-bold">Habilidades</h3>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {sellerSkills.map((skill) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="rounded-full border border-border bg-background px-3 py-1 text-sm"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Servicos de {seller.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {services.length} servico{services.length !== 1 ? 's' : ''} publicado
                  {services.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {services.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} seller={sellerCard} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
                <p className="text-lg font-semibold">Nenhum servico publicado</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Este participante ainda não possui anúncios ativos.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isEditOpen ? (
          <EditProfileModal
            profile={editableProfile}
            onSave={handleProfileSave}
            onCancel={() => setIsEditOpen(false)}
            onAvatarUpload={handleAvatarUpload}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
