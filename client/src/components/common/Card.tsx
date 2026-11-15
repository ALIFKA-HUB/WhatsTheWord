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
  none: 'border-rule',
  cyan: 'border-teal',
  violet: 'border-rule',
  amber: 'border-sun',
  crimson: 'border-stamp shadow-print-red',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4 sm:p-5',
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
          'relative rounded-3xl bg-cardstock border text-ink overflow-hidden',
          glowStyles[glow],
          glow !== 'crimson' && 'shadow-print',
          paddingStyles[padding],
          hoverable && 'hover:shadow-print-lg transition-shadow',
          interactive && 'cursor-pointer active:translate-y-[1px] active:shadow-print-sm transition-transform',
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
      className={cn('text-base sm:text-lg font-bold tracking-tight text-ink font-condensed', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-xs sm:text-sm text-ink-muted font-normal leading-relaxed', className)} {...props} />
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
    <div ref={ref} className={cn('flex items-center pt-4 border-t border-rule', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
