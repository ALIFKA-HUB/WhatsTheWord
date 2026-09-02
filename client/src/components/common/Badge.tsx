import React from 'react';
import { PlayerRole } from '../../types/game.types';
import { cn } from '../../utils/cn';
import { Shield, EyeOff, HelpCircle, Mic, Skull, CheckCircle2, Crown, Wifi } from 'lucide-react';

export type BadgeVariant =
  | 'cyan'
  | 'crimson'
  | 'violet'
  | 'amber'
  | 'emerald'
  | 'slate'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  pulse?: boolean;
  icon?: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  cyan: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30 shadow-[0_0_12px_-3px_rgba(6,182,212,0.3)]',
  crimson: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_12px_-3px_rgba(244,63,94,0.3)]',
  violet: 'bg-purple-500/15 text-purple-300 border-purple-500/30 shadow-[0_0_12px_-3px_rgba(168,85,247,0.3)]',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_12px_-3px_rgba(245,158,11,0.3)]',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_-3px_rgba(16,185,129,0.3)]',
  slate: 'bg-slate-800/60 text-slate-400 border-white/10',
  outline: 'bg-transparent text-slate-300 border-white/20',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] px-2 py-0.5 rounded-md gap-1 font-medium',
  md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold',
  lg: 'text-sm px-3.5 py-1.5 rounded-xl gap-2 font-bold tracking-wide',
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'cyan',
  size = 'md',
  pulse = false,
  icon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center select-none border backdrop-blur-sm transition-all',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {icon && <span className="inline-flex shrink-0 items-center justify-center">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export interface RoleBadgeProps {
  role: PlayerRole;
  size?: BadgeSize;
  showIcon?: boolean;
  className?: string;
  indonesian?: boolean;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = 'md',
  showIcon = true,
  className,
  indonesian = true,
}) => {
  switch (role) {
    case 'CIVILIAN':
      return (
        <Badge
          variant="cyan"
          size={size}
          icon={showIcon ? <Shield className="w-3.5 h-3.5" /> : undefined}
          className={className}
        >
          {indonesian ? 'Warga (Civilian)' : 'Civilian'}
        </Badge>
      );
    case 'UNDERCOVER':
      return (
        <Badge
          variant="crimson"
          size={size}
          icon={showIcon ? <EyeOff className="w-3.5 h-3.5" /> : undefined}
          className={className}
        >
          {indonesian ? 'Impostor (Undercover)' : 'Undercover'}
        </Badge>
      );
    case 'MR_WHITE':
      return (
        <Badge
          variant="violet"
          size={size}
          icon={showIcon ? <HelpCircle className="w-3.5 h-3.5" /> : undefined}
          className={className}
        >
          {indonesian ? 'Buta Kata (Mr. White)' : 'Mr. White'}
        </Badge>
      );
    default:
      return null;
  }
};

export type PlayerStatus = 'active' | 'speaking' | 'eliminated' | 'voted' | 'host';

export interface StatusBadgeProps {
  status: PlayerStatus;
  size?: BadgeSize;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
}) => {
  switch (status) {
    case 'speaking':
      return (
        <Badge
          variant="cyan"
          size={size}
          pulse
          icon={<Mic className="w-3 h-3 text-cyan-300 animate-pulse" />}
          className={cn('border-cyan-400 animate-pulse', className)}
        >
          Bicara
        </Badge>
      );
    case 'active':
      return (
        <Badge
          variant="emerald"
          size={size}
          icon={<Wifi className="w-3 h-3 text-emerald-400" />}
          className={className}
        >
          Aktif
        </Badge>
      );
    case 'eliminated':
      return (
        <Badge
          variant="slate"
          size={size}
          icon={<Skull className="w-3 h-3 text-rose-400" />}
          className={cn('line-through opacity-70 border-rose-900/40 text-rose-400', className)}
        >
          Tereliminasi
        </Badge>
      );
    case 'voted':
      return (
        <Badge
          variant="amber"
          size={size}
          icon={<CheckCircle2 className="w-3 h-3 text-amber-400" />}
          className={className}
        >
          Memilih
        </Badge>
      );
    case 'host':
      return (
        <Badge
          variant="amber"
          size={size}
          icon={<Crown className="w-3 h-3 text-amber-400" />}
          className={className}
        >
          Host
        </Badge>
      );
    default:
      return null;
  }
};

export default Badge;
