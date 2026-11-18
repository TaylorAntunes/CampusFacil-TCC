import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NeonButton } from '@/components/NeonButton';
import { ServiceCard } from '@/components/ServiceCard';
import { CategoryChip } from '@/components/CategoryChip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveApiAssetUrl } from '@/services/api';
import { categoriesService, Category as BackendCategory } from '@/services/categories.service';
import { advertisementsService, Advertisement } from '@/services/advertisements.service';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<Advertisement[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadFeaturedServices = async () => {
      try {
        setIsLoadingServices(true);
        const res = await advertisementsService.getAll({
          availability: 'ACTIVE',
          page: 1,
        });
        if (!isMounted) return;
        setFeaturedServices(res.advertisements.slice(0, 8));
      } catch (err) {
        console.error('Erro ao carregar serviços em destaque:', err);
      } finally {
        if (isMounted) {
          setIsLoadingServices(false);
        }
      }
    };

    loadFeaturedServices();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        const res = await categoriesService.getAll();
        if (isMounted) {
          setCategories(res);
        }
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredCategories = categories.slice(0, 8);

  const trustedSellers = featuredServices
    .map((service) => service.author?.name)
    .filter(Boolean) as string[];
  const highlightedSellers = Array.from(new Set(trustedSellers)).slice(0, 5);

  type Author = NonNullable<Advertisement['author']>;
  const isAuthor = (author?: Advertisement['author']): author is Author => Boolean(author);

  const sellerHighlights = useMemo(() => {
    const authors = featuredServices
      .map((service) => service.author)
      .filter(isAuthor);
    const uniqueAuthors: Author[] = [];
    const seenIds = new Set<string>();
    for (const author of authors) {
      if (seenIds.has(author.id)) continue;
      seenIds.add(author.id);
      uniqueAuthors.push(author);
      if (uniqueAuthors.length >= 4) break;
    }
    return uniqueAuthors;
  }, [featuredServices]);

  const reviewHighlights = useMemo(() => {
    const reviews = featuredServices
      .flatMap((service) => service.reviews ?? [])
      .map((review) => {
        const reviewer = review.reviewer;
        const avatarUrl = reviewer?.avatar_url
          ? resolveApiAssetUrl(reviewer.avatar_url) ?? reviewer.avatar_url
          : `https://api.dicebear.com/7.x/avataaars/svg?seed=${reviewer?.name ?? 'user'}`;
        return {
          id: review.id ?? `${reviewer?.id ?? 'user'}-${review.created_at ?? Math.random()}`,
          rating: review.rating,
          userName: reviewer?.name ?? 'Participante',
          userAvatar: avatarUrl,
          date: review.created_at
            ? new Date(review.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
            : '',
          comment: review.comment ?? 'Comentário não divulgado.',
        };
      });
    return reviews.slice(0, 3);
  }, [featuredServices]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50" />
        <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] -z-10 opacity-30" />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Conectando talentos da comunidade acadêmica</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
              Encontre e ofereça serviços <br className="hidden md:block" />
              <span className="text-gradient">na comunidade acadêmica.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Conecte-se com a comunidade do IFCE, divulgue suas habilidades, encontre serviços e acompanhe suas solicitações em um único ambiente.
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/explore">
                <NeonButton size="lg" className="w-full sm:w-auto">
                  Explorar serviços
                  <ArrowRight className="ml-2 w-5 h-5" />
                </NeonButton>
              </Link>
              <Link to="/explore">
                <NeonButton variant="outline" size="lg" className="w-full sm:w-auto">
                  Oferecer serviços
                </NeonButton>
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mt-20 pt-10 border-t border-border/50 flex flex-wrap justify-center gap-8 md:gap-16 opacity-70"
          >
            {(highlightedSellers.length > 0 ? highlightedSellers : ['Monitoria e reforço acadêmico', 'Auxílio em programação']).map((partner) => (
              <div key={partner} className="text-xl font-bold tracking-wider">
                {partner}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categorias Populares */}
      <section className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold">
              Categorias de <span className="text-primary">serviços</span>
            </h2>
            <Link to="/explore" className="hidden sm:flex items-center text-primary hover:text-primary/80 transition-colors font-medium">
              Ver todas <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {featuredCategories.map((category) => (
              <CategoryChip key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Serviços em Destaque */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Serviços em <span className="text-primary">Destaque</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Conheça serviços como monitoria e reforço acadêmico, auxílio em programação, design de apresentações, edição de vídeos, serviços de informática e revisão e formatação de documentos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingServices ? (
              [...Array(4)].map((_, index) => (
                <div key={index} className="h-[360px] animate-pulse rounded-3xl bg-card/50" />
              ))
            ) : featuredServices.length > 0 ? (
              featuredServices.map((service) => {
                if (!service.author) return null;
                return (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    seller={service.author}
                  />
                );
              })
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-muted-foreground">Nenhum serviço encontrado no momento.</p>
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <Link to="/explore">
              <NeonButton variant="outline">Ver mais serviços</NeonButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Como <span className="text-primary">Funciona</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Explore serviços, entre em contato com os participantes e acompanhe suas solicitações no CampusFácil.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0" />

            {[
              {
                step: '01',
                title: 'Encontre um serviço',
                desc: 'Navegue pelas categorias, consulte os anúncios e encontre serviços relacionados às suas necessidades no campus.',
              },
              {
                step: '02',
                title: 'Envie uma solicitação',
                desc: 'Descreva sua necessidade e aguarde a resposta do prestador. Utilize as conversas para combinar os detalhes do serviço.',
              },
              {
                step: '03',
                title: 'Acompanhe o serviço',
                desc: 'Consulte o andamento da solicitação, mantenha contato com o prestador e registre sua avaliação após a conclusão.',
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center group">
                <div className="w-24 h-24 rounded-2xl bg-card border-2 border-primary/20 flex items-center justify-center text-3xl font-black text-primary mb-6 group-hover:border-primary group-hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] transition-all z-10">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantias */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-neon p-1 rounded-3xl">
            <div className="bg-card rounded-[22px] p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    Serviços na comunidade do <span className="text-primary">IFCE</span>
                  </h2>
                  <div className="space-y-6">
                    {[
                      {
                        icon: ShieldCheck,
                        title: 'Cadastro institucional',
                        text: 'O cadastro é destinado à comunidade acadêmica do IFCE e exige e-mail institucional com domínio @ifce.edu.br.',
                      },
                      {
                        icon: Star,
                        title: 'Habilidades compartilhadas',
                        text: 'Divulgue suas habilidades e conheça os serviços oferecidos por outros participantes da comunidade acadêmica.',
                      },
                      {
                        icon: Zap,
                        title: 'Comunicação e acompanhamento',
                        text: 'Utilize as conversas para esclarecer dúvidas e acompanhe suas solicitações em um único ambiente.',
                      },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                          <p className="text-muted-foreground">{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-border">
                    <img
                      src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="Pessoas reunidas em uma atividade colaborativa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-6 -left-6 bg-background border border-border p-6 rounded-2xl shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-4">
                        {(
                          sellerHighlights.length > 0
                            ? sellerHighlights
                            : Array.from({ length: 4 }, () => undefined)
                        ).map((seller, idx) => {
                          const avatar = seller?.avatar_url
                            ? resolveApiAssetUrl(seller.avatar_url) ?? seller.avatar_url
                            : `https://api.dicebear.com/7.x/avataaars/svg?seed=campusfacil-${idx}`;
                          const name = seller?.name ?? `Participante ${idx + 1}`;
                          return (
                            <img
                              key={seller?.id ?? `placeholder-${idx}`}
                              src={avatar}
                              alt={name}
                              className="w-12 h-12 rounded-full border-2 border-background object-cover"
                            />
                          );
                        })}
                      </div>
                      <div>
                        <div className="font-bold text-lg">IFCE</div>
                        <div className="text-sm text-muted-foreground">Comunidade acadêmica</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Experiências da <span className="text-primary">comunidade</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviewHighlights.length > 0 ? (
              reviewHighlights.map((review) => (
                <div
                  key={review.id}
                  className="bg-background p-8 rounded-2xl border border-border hover:border-primary/30 transition-all"
                >
                  <div className="flex text-yellow-400 mb-6">
                    {[...Array(review.rating)].map((_, index) => (
                      <Star key={index} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-lg mb-8 italic text-muted-foreground">
                    "{review.comment}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img
                      src={review.userAvatar}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full border border-border object-cover"
                    />
                    <div>
                      <div className="font-bold">{review.userName}</div>
                      <div className="text-sm text-muted-foreground">Participante do CampusFácil</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground">
                Ainda não há avaliações disponíveis para exibição.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
