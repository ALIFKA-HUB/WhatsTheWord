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
  none: 'border-white/10 hover:border-white/20',
  cyan: 'border-cyan-500/30 shadow-[0_0_25px_-5px_rgba(6,182,212,0.25)] hover:border-cyan-400/60 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)]',
  crimson: 'border-rose-500/30 shadow-[0_0_25px_-5px_rgba(244,63,94,0.25)] hover:border-rose-400/60 hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.4)]',
  violet: 'border-purple-500/30 shadow-[0_0_25px_-5px_rgba(168,85,247,0.25)] hover:border-purple-400/60 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.4)]',
  amber: 'border-amber-500/30 shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)] hover:border-amber-400/60 hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.4)]',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3 sm:p-4',
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
          'relative rounded-2xl bg-slate-900/80 backdrop-blur-md border shadow-xl transition-all duration-200 text-slate-100 overflow-hidden',
          glowStyles[glow],
          paddingStyles[padding],
          hoverable && 'hover:scale-[1.01] hover:bg-slate-900/90',
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
    <div ref={ref} className={cn('flex flex-col space-y-1.5 pb-4', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-lg sm:text-xl font-bold tracking-tight text-slate-100 font-display', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs sm:text-sm text-slate-400 font-sans', className)} {...props} />
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
    <div ref={ref} className={cn('flex items-center pt-4 border-t border-white/5', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export default Card;
