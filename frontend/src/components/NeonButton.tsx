import React from 'react';
import { cn } from '@/lib/utils';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function NeonButton({
  className,
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: NeonButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,212,255,0.4)] hover:shadow-[0_0_25px_rgba(0,212,255,0.6)]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-[0_0_15px_rgba(123,47,255,0.4)] hover:shadow-[0_0_25px_rgba(123,47,255,0.6)]",
    outline: "border border-primary text-primary hover:bg-primary/10 shadow-[0_0_10px_rgba(0,212,255,0.2)] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
  };

  return (
    <button
      className={cn(
        baseClasses,
        sizeClasses[size],
        variants[variant],
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
