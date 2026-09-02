import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGameSound } from '../../hooks/useGameSound';

export type ButtonVariant = 'primary' | 'danger' | 'accent' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  playSoundOnTap?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-zinc-100 text-zinc-950 font-semibold hover:bg-white active:bg-zinc-200 border border-zinc-200 shadow-sm',
  secondary:
    'bg-zinc-900/90 text-zinc-200 font-medium hover:bg-zinc-800 hover:text-white active:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 shadow-sm',
  danger:
    'bg-rose-950/40 text-rose-300 font-medium hover:bg-rose-900/50 hover:text-rose-200 border border-rose-900/50 hover:border-rose-700 active:bg-rose-900/70',
  accent:
    'bg-cyan-500/15 text-cyan-300 font-medium hover:bg-cyan-500/25 hover:text-cyan-200 border border-cyan-500/30 hover:border-cyan-400/50',
  outline:
    'bg-transparent border border-zinc-700/80 text-zinc-300 hover:bg-zinc-800/60 hover:text-white hover:border-zinc-600 active:bg-zinc-800',
  ghost:
    'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 active:bg-zinc-800 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs sm:text-sm rounded-lg gap-2',
  md: 'px-4 py-2 text-sm sm:text-base rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-base rounded-xl gap-2.5 font-medium',
  xl: 'px-6 py-3.5 text-base sm:text-lg rounded-xl gap-3 font-semibold tracking-wide',
  icon: 'p-2.5 rounded-xl aspect-square flex items-center justify-center',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      playSoundOnTap = true,
      disabled,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const { playButtonTap } = useGameSound();
    const isDisabled = disabled || isLoading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      if (playSoundOnTap) {
        try {
          playButtonTap();
        } catch {
          // ignore audio failure
        }
      }
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center select-none font-sans transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          'active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
            {loadingText ? <span>{loadingText}</span> : children ? <span>{children}</span> : null}
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0 items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
