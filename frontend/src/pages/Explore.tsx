import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { ServiceCard } from '@/components/ServiceCard';
import { NeonButton } from '@/components/NeonButton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { advertisementsService } from '@/services/advertisements.service';
import { categoriesService, Category } from '@/services/categories.service';
import { useAuth } from '@/contexts/AuthContext';

export default function Explore() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const catsRes = await categoriesService.getAll();
        setCategories(catsRes || []);
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    async function fetchAds() {
      try {
        setIsLoading(true);
        const res = await advertisementsService.getAll({
          q: searchQuery,
          category: selectedCategories.length > 0 ? selectedCategories[0] : undefined, // O backend parece aceitar apenas uma categoria por enquanto
        });
        setAdvertisements(
          (res.advertisements || []).filter(
            (advertisement) => advertisement.authorId !== user?.id,
          ),
        );
      } catch (err) {
        console.error('Erro ao buscar anúncios:', err);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchAds();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategories, user?.id]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName) 
        : [...prev, categoryName]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Explorar serviços</h1>
          <p className="text-muted-foreground mt-1">Encontre serviços oferecidos pela comunidade acadêmica do IFCE.</p>
        </div>
        
        <div className="w-full md:w-auto flex gap-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Buscar monitoria, programação, informática..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 bg-card border border-border rounded-lg pl-10 pr-4 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
         <button 
            className="md:hidden p-2 rounded-lg bg-card border border-border flex items-center justify-center text-foreground"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className={`lg:w-64 shrink-0 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-28 space-y-8 bg-card p-6 rounded-xl border border-border">
            <div className="flex items-center gap-2 font-semibold text-lg border-b border-border pb-4">
              <SlidersHorizontal className="w-5 h-5" />
              Filtros
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Categorias</h3>
              <div className="space-y-3">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`cat-${category.id}`} 
                      className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() => toggleCategory(category.name)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="text-sm font-medium cursor-pointer">
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <NeonButton className="w-full" onClick={() => setIsFiltersOpen(false)}>Aplicar Filtros</NeonButton>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">
              {isLoading ? 'Buscando...' : `${advertisements.length} serviços encontrados`}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-100 bg-card/50 animate-pulse rounded-xl border border-border" />
              ))
            ) : advertisements.length > 0 ? (
              advertisements.map((ad, index) => (
                <motion.div 
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ServiceCard service={ad} seller={ad.author} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-xl text-muted-foreground">Nenhum serviço encontrado para sua busca.</p>
                <NeonButton 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategories([]);
                  }}
                >
                  Limpar Filtros
                </NeonButton>
              </div>
            )}
          </div>
          
          {!isLoading && advertisements.length >= 20 && (
            <div className="mt-12 flex justify-center">
              <NeonButton variant="outline" size="lg">Carregar Mais</NeonButton>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
