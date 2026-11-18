import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { advertisementsService } from '../services/advertisements.service';
import { categoriesService, Category } from '../services/categories.service';
import { useEffect, useState } from 'react';

const createAdSchema = z.object({
  title: z.string().min(5, 'Título deve ter no mínimo 5 caracteres'),
  description: z.string().min(20, 'Descrição deve ter no mínimo 20 caracteres'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  price: z.coerce.number().min(0, 'Preço deve ser maior que 0'),
  image: z.instanceof(FileList).optional(),
});

type CreateAdFormData = z.infer<typeof createAdSchema>;

export function CreateAdvertisementPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateAdFormData>({
    resolver: zodResolver(createAdSchema),
  });
  const selectedImage = watch('image');

  useEffect(() => {
    const imageFile = selectedImage?.[0];

    if (!imageFile) {
      setPreviewImage(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewImage(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCategories();
  }, [user, navigate]);

  const loadCategories = async () => {
    try {
      const data = await categoriesService.getAll();
      setCategories(data);
    } catch (err) {
      addToast('error', 'Erro ao carregar categorias');
    }
  };

  const onSubmit = async (data: CreateAdFormData) => {
    try {
      setIsSubmitting(true);
      const image = data.image?.[0];
      await advertisementsService.create({
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        price: data.price,
        image,
      });
      addToast('success', 'Anúncio criado com sucesso!');
      navigate('/meus-anuncios');
    } catch (err) {
      addToast('error', 'Erro ao criar anúncio');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="grow">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-4 text-sm text-primary">
              <Link to="/" className="underline">← Voltar</Link>
              <span className="text-muted-foreground">/</span>
              <span>Criar Novo Anúncio</span>
            </div>

            <div className="bg-card border border-border rounded-3xl p-10 shadow-2xl shadow-primary/10">
              <h1 className="text-3xl font-bold mb-8">Novo anúncio</h1>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-semibold text-muted-foreground block">Título</label>
                  <input
                    id="title"
                    type="text"
                    {...register('title')}
                    className="w-full rounded-2xl border border-border px-4 py-3 bg-background/60 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder="Ex.: Monitoria e reforço acadêmico"
                  />
                  {errors.title && <p className="text-destructive text-xs">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-semibold text-muted-foreground block">Descrição</label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={6}
                    className="w-full rounded-2xl border border-border px-4 py-3 bg-background/60 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                    placeholder="Descreva o serviço, as atividades previstas e a disponibilidade para atender a comunidade acadêmica."
                  />
                  {errors.description && <p className="text-destructive text-xs">{errors.description.message}</p>}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="categoryId" className="text-sm font-semibold text-muted-foreground block">Categoria</label>
                    <select
                      id="categoryId"
                      {...register('categoryId')}
                      className="w-full rounded-2xl border border-border px-4 py-3 bg-background/60 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && <p className="text-destructive text-xs">{errors.categoryId.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-semibold text-muted-foreground block">Preço (R$)</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register('price')}
                      className="w-full rounded-2xl border border-border px-4 py-3 bg-background/60 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                      placeholder="0.00"
                    />
                    {errors.price && <p className="text-destructive text-xs">{errors.price.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="image" className="text-sm font-semibold text-muted-foreground block">Imagem (opcional)</label>
                  {previewImage && (
                    <div className="overflow-hidden rounded-2xl border border-border bg-background/40">
                      <img
                        src={previewImage}
                        alt="Pré-visualização da imagem selecionada"
                        className="h-56 w-full object-cover"
                      />
                    </div>
                  )}
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    {...register('image')}
                    className="w-full rounded-2xl border border-border px-4 py-3 bg-background/60"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-gradient-neon text-primary-foreground py-3 font-semibold text-base transition hover:opacity-90 disabled:opacity-60"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Anúncio'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
