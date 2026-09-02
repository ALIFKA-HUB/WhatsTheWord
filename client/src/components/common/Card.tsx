import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export type CardGlow = 'none' | 'cyan' | 'crimson' | 'violet' | 'amber';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: CardGlow;
  padding?: CardPadding;
  hoverable?: boolean;
  interactive?: boolean;
}

const glowStyles: Record<CardGlow, string> = {
  none: 'border-zinc-800/80 hover:border-zinc-700/80',
  cyan: 'border-cyan-500/30 hover:border-cyan-400/50',
  crimson: 'border-rose-500/30 hover:border-rose-400/50',
  violet: 'border-purple-500/30 hover:border-purple-400/50',
  amber: 'border-amber-500/30 hover:border-amber-400/50',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3.5 sm:p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      glow = 'none',
      padding = 'md',
      hoverable = false,
      interactive = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-2xl bg-zinc-900/60 backdrop-blur-md border transition-all duration-200 text-zinc-100 overflow-hidden',
          glowStyles[glow],
          paddingStyles[padding],
          hoverable && 'hover:bg-zinc-900/90 hover:border-zinc-700',
          interactive && 'cursor-pointer active:scale-[0.99]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1 pb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-base sm:text-lg font-semibold tracking-tight text-zinc-100', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4 border-t border-zinc-800/80', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
