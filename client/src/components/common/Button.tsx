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
    'bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 border border-cyan-300/40 hover:shadow-cyan-400/40',
  danger:
    'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold shadow-lg shadow-rose-600/30 border border-rose-400/40 hover:shadow-rose-500/50',
  accent:
    'bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 text-white font-bold shadow-lg shadow-purple-600/30 border border-purple-400/40 hover:shadow-purple-500/50',
  secondary:
    'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 hover:border-white/20 backdrop-blur-sm shadow-md',
  outline:
    'bg-transparent border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 active:bg-cyan-500/20 shadow-sm',
  ghost:
    'bg-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 active:bg-white/10 border border-transparent',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs sm:text-sm rounded-xl gap-2',
  md: 'px-4 py-2 text-sm sm:text-base rounded-xl gap-2',
  lg: 'px-6 py-3 text-base sm:text-lg rounded-2xl gap-2.5 font-semibold',
  xl: 'px-8 py-4 text-lg sm:text-xl rounded-2xl gap-3 font-bold tracking-wide',
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
          'relative inline-flex items-center justify-center select-none font-sans transition-all duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
          'active:scale-[0.97] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 disabled:hover:brightness-100',
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
            {leftIcon && <span className="inline-flex shrink-0 items-center justify-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="inline-flex shrink-0 items-center justify-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
