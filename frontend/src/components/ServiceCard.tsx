import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveApiAssetUrl } from '@/services/api';
import { StarRating } from './StarRating';

interface ServiceCardProps {
  service: any;
  seller: any;
}

export function ServiceCard({ service, seller }: ServiceCardProps) {
  // Calcular média de avaliações se vier do backend
  const rating = service.rating || (service.reviews?.length > 0 
    ? service.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / service.reviews.length 
    : 0);
  
  const reviewCount = service.reviewCount || service.reviews?.length || 0;
  
  const categoryName = service.category?.name || service.category || 'Geral';
  
  // Imagem do serviço (com fallback)
  const imageUrl = service.image?.startsWith('http') 
    ? service.image 
    : (resolveApiAssetUrl(service.image) ?? `https://picsum.photos/seed/${service.id}/400/250`);

  // Avatar do vendedor
  const sellerAvatar = seller?.avatar_url 
    ? (resolveApiAssetUrl(seller.avatar_url) ?? seller.avatar_url)
    : (seller?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seller?.name || 'User'}`);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group flex flex-col h-full bg-card rounded-xl overflow-hidden border border-border transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]"
    >
      <Link to={`/service/${service.id}`} className="block relative aspect-video overflow-hidden">
        <img 
          src={imageUrl} 
          alt={service.title} 
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium border border-border">
          {categoryName}
        </div>
      </Link>
      
      <div className="flex flex-col flex-grow p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-shrink-0 relative">
            <Avatar className="h-8 w-8 ring-2 ring-background group-hover:ring-primary/30 transition-all">
              <AvatarImage src={sellerAvatar} alt={seller?.name} />
              <AvatarFallback>{(seller?.name || 'U').substring(0, 2)}</AvatarFallback>
            </Avatar>
            {seller?.verified && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-2 ring-background">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5 text-white">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
          <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors line-clamp-1">
            {seller?.name || 'Usuário'}
          </span>
        </div>
        
        <Link to={`/service/${service.id}`} className="flex-grow">
          <h3 className="text-lg font-semibold leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {service.title}
          </h3>
        </Link>
        
        <div className="mt-4 flex items-center justify-between">
          <StarRating rating={rating} count={reviewCount} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">A partir de</span>
          <span className="text-xl font-bold text-foreground">
            R$ {Number(service.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
