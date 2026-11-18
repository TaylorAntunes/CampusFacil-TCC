export interface Seller {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  rating: number;
  reviews: number;
  responseTime: string;
  memberSince: string;
  verified: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  sellerId: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  features: string[];
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
}

export const CATEGORIES: Category[] = [
  { id: 'web-design', name: 'Web Design', iconName: 'Monitor' },
  { id: 'seo', name: 'SEO', iconName: 'Search' },
  { id: 'video-editing', name: 'Video Editing', iconName: 'Video' },
  { id: 'copywriting', name: 'Copywriting', iconName: 'PenTool' },
  { id: 'logo-design', name: 'Logo Design', iconName: 'Hexagon' },
  { id: 'social-media', name: 'Social Media', iconName: 'Share2' },
  { id: 'programming', name: 'Programming', iconName: 'Code' },
  { id: 'marketing', name: 'Marketing', iconName: 'TrendingUp' }
];

export const SELLERS: Seller[] = [
  {
    id: 's1',
    name: 'Carlos Mendes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CarlosMendes',
    bio: 'Desenvolvedor Full Stack com 10 anos de experiência criando aplicações web modernas e escaláveis.',
    rating: 4.9,
    reviews: 124,
    responseTime: '1 hora',
    memberSince: '2020',
    verified: true
  },
  {
    id: 's2',
    name: 'Ana Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AnaSilva',
    bio: 'Especialista em UI/UX Design, apaixonada por criar interfaces intuitivas e minimalistas.',
    rating: 5.0,
    reviews: 89,
    responseTime: '2 horas',
    memberSince: '2021',
    verified: true
  },
  {
    id: 's3',
    name: 'Rafael Costa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RafaelCosta',
    bio: 'Editor de vídeo profissional. Transformo suas gravações em conteúdo viral para redes sociais.',
    rating: 4.8,
    reviews: 215,
    responseTime: '3 horas',
    memberSince: '2019',
    verified: false
  },
  {
    id: 's4',
    name: 'Mariana Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MarianaSantos',
    bio: 'Copywriter focada em conversão. Escrevo textos que vendem e conectam com sua audiência.',
    rating: 4.9,
    reviews: 156,
    responseTime: '1 hora',
    memberSince: '2022',
    verified: true
  }
];

export const REVIEWS: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'Lucas P.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LucasP', rating: 5, date: '12 Out 2023', comment: 'Trabalho excepcional! Entregou antes do prazo e com qualidade superior ao esperado.' },
  { id: 'r2', userId: 'u2', userName: 'Juliana M.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JulianaM', rating: 5, date: '05 Nov 2023', comment: 'Muito atencioso e profissional. Recomendo de olhos fechados.' },
  { id: 'r3', userId: 'u3', userName: 'Fernando T.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FernandoT', rating: 4, date: '20 Nov 2023', comment: 'Bom trabalho, apenas algumas pequenas revisões foram necessárias, mas foram feitas rapidamente.' },
  { id: 'r4', userId: 'u4', userName: 'Camila R.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CamilaR', rating: 5, date: '01 Dez 2023', comment: 'O melhor serviço que já contratei na plataforma. O resultado final ficou incrível.' },
  { id: 'r5', userId: 'u5', userName: 'Pedro H.', userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PedroH', rating: 5, date: '15 Dez 2023', comment: 'Comunicação clara durante todo o processo. Super satisfeito.' }
];

export const SERVICES: Service[] = [
  {
    id: 'srv-1',
    title: 'Desenvolvimento de Landing Page de Alta Conversão',
    description: 'Crio landing pages ultra-rápidas e otimizadas para conversão usando React e TailwindCSS. Ideal para lançamentos de produtos e infoprodutos. O design será moderno, responsivo e focado em capturar leads.',
    price: 1500,
    categoryId: 'web-design',
    sellerId: 's1',
    image: 'https://picsum.photos/seed/srv-1/400/250',
    rating: 4.9,
    reviewCount: 45,
    deliveryTime: '5 dias',
    features: ['Design Responsivo', 'Otimização SEO', 'Integração com Analytics', 'Código Fonte', 'Alta Velocidade (90+ no PageSpeed)']
  },
  {
    id: 'srv-2',
    title: 'Design de Interface UI/UX para Aplicativos Mobile',
    description: 'Vou criar o design completo do seu aplicativo mobile no Figma. Entregáveis incluem wireframes, protótipos navegáveis e design system. Foco em usabilidade e estética moderna.',
    price: 2200,
    categoryId: 'web-design',
    sellerId: 's2',
    image: 'https://picsum.photos/seed/srv-2/400/250',
    rating: 5.0,
    reviewCount: 32,
    deliveryTime: '10 dias',
    features: ['Até 10 telas', 'Protótipo interativo no Figma', 'Design System básico', 'Exportação de assets', 'Revisões ilimitadas']
  },
  {
    id: 'srv-3',
    title: 'Edição de Vídeo Dinâmica para TikTok e Reels',
    description: 'Edito seus vídeos no estilo "Alex Hormozi" com legendas dinâmicas, efeitos sonoros, cortes rápidos e retenção máxima. Aumente seu engajamento e seguidores.',
    price: 150,
    categoryId: 'video-editing',
    sellerId: 's3',
    image: 'https://picsum.photos/seed/srv-3/400/250',
    rating: 4.8,
    reviewCount: 112,
    deliveryTime: '2 dias',
    features: ['Edição de até 60 segundos', 'Legendas animadas', 'Sound Design', 'Color Grading', 'Formato 9:16 vertical']
  },
  {
    id: 'srv-4',
    title: 'Copywriting Persuasivo para Página de Vendas',
    description: 'Escrevo a copy completa da sua página de vendas usando gatilhos mentais comprovados e técnicas avançadas de persuasão. Transforme visitantes em clientes pagantes.',
    price: 800,
    categoryId: 'copywriting',
    sellerId: 's4',
    image: 'https://picsum.photos/seed/srv-4/400/250',
    rating: 4.9,
    reviewCount: 67,
    deliveryTime: '4 dias',
    features: ['Pesquisa de público-alvo', 'Headline magnética', 'Estrutura completa de vendas', 'Gatilhos mentais', 'Até 1500 palavras']
  },
  {
    id: 'srv-5',
    title: 'Otimização SEO Completa On-Page e Off-Page',
    description: 'Coloque seu site na primeira página do Google. Faço análise de palavras-chave, otimização on-page de conteúdo e meta tags, e estratégia básica de link building.',
    price: 1200,
    categoryId: 'seo',
    sellerId: 's1',
    image: 'https://picsum.photos/seed/srv-5/400/250',
    rating: 4.7,
    reviewCount: 28,
    deliveryTime: '7 dias',
    features: ['Auditoria SEO inicial', 'Pesquisa de 20 palavras-chave', 'Otimização de 5 páginas', 'Configuração de Sitemap e Robots', 'Relatório final']
  },
  {
    id: 'srv-6',
    title: 'Criação de Identidade Visual e Logo Minimalista',
    description: 'Crio uma marca forte e memorável para sua empresa. O pacote inclui logo primário, variações, paleta de cores, tipografia e manual da marca.',
    price: 950,
    categoryId: 'logo-design',
    sellerId: 's2',
    image: 'https://picsum.photos/seed/srv-6/400/250',
    rating: 4.9,
    reviewCount: 54,
    deliveryTime: '7 dias',
    features: ['3 conceitos iniciais', 'Logo em vetor (AI/EPS)', 'Arquivos PNG/JPG em alta', 'Manual de Identidade Visual', 'Mockups de aplicação']
  },
  {
    id: 'srv-7',
    title: 'Gestão Estratégica de Redes Sociais (Mensal)',
    description: 'Gerencio seu Instagram e LinkedIn com foco em crescimento orgânico. Inclui criação de conteúdo, agendamento de posts e interação com seguidores.',
    price: 1800,
    categoryId: 'social-media',
    sellerId: 's4',
    image: 'https://picsum.photos/seed/srv-7/400/250',
    rating: 5.0,
    reviewCount: 19,
    deliveryTime: '30 dias',
    features: ['12 posts no feed/mês', 'Stories diários', 'Design dos posts', 'Redação das legendas', 'Relatório de métricas']
  },
  {
    id: 'srv-8',
    title: 'Desenvolvimento de API RESTful com Node.js',
    description: 'Crio uma API robusta, segura e escalável para sua aplicação usando Node.js, Express, TypeScript e banco de dados à sua escolha (SQL ou NoSQL).',
    price: 3000,
    categoryId: 'programming',
    sellerId: 's1',
    image: 'https://picsum.photos/seed/srv-8/400/250',
    rating: 5.0,
    reviewCount: 15,
    deliveryTime: '15 dias',
    features: ['Autenticação JWT', 'Documentação Swagger', 'Testes automatizados', 'Deploy na AWS ou Vercel', 'Código limpo (Clean Architecture)']
  }
];
