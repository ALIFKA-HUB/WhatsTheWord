import React, { forwardRef } from 'react';
import { SpinnerGap } from '@phosphor-icons/react';
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
    'bg-teal text-ink shadow-push-teal hover:brightness-105 active:translate-y-[3px] active:shadow-none font-extrabold',
  secondary:
    'bg-cardstock text-ink shadow-print-sm hover:bg-paper-muted active:translate-y-[2px] active:shadow-none font-extrabold',
  danger:
    'bg-stamp text-ink shadow-push-coral hover:brightness-105 active:translate-y-[3px] active:shadow-none font-extrabold',
  accent:
    'bg-ink text-white shadow-push-navy hover:brightness-125 active:translate-y-[3px] active:shadow-none font-extrabold',
  outline:
    'bg-transparent text-ink border border-rule hover:bg-paper-muted font-bold active:translate-y-[2px]',
  ghost:
    'bg-transparent text-ink-muted hover:text-ink hover:bg-paper-muted border border-transparent font-bold',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-3 py-1 text-xs rounded-full gap-1.5',
  sm: 'px-4 py-1.5 text-xs sm:text-sm rounded-full gap-2',
  md: 'px-5 py-2 text-sm sm:text-base rounded-full gap-2',
  lg: 'px-6 py-2.5 text-base rounded-full gap-2.5',
  xl: 'px-7 py-3.5 text-base sm:text-lg rounded-full gap-3',
  icon: 'p-2.5 rounded-full aspect-square flex items-center justify-center',
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
          'relative inline-flex items-center justify-center select-none font-sans transition-all duration-100 ease-out outline-none focus-visible:ring-2 focus-visible:ring-stamp focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
          'disabled:opacity-40 disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <SpinnerGap className="w-4 h-4 animate-spin text-current shrink-0" weight="bold" />
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
