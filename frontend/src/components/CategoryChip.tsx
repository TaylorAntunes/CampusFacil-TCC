import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface CategoryChipData {
  id: string;
  name: string;
  iconName?: string;
  icon?: string;
}

interface CategoryChipProps {
  category: CategoryChipData;
}

export function CategoryChip({ category }: CategoryChipProps) {
  const iconKey = category.iconName || category.icon || 'Tag';
  const iconLookup = Icons as unknown as Record<string, LucideIcon>;
  const Icon = iconLookup[iconKey] ?? Icons.Tag;

  return (
    <Link to={`/explore?category=${category.id}`}>
      <div className="flex flex-col items-center justify-center p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:bg-card/80 hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] group cursor-pointer h-full">
        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">{category.name}</span>
      </div>
    </Link>
  );
}
