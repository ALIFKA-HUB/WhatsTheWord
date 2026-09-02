import React from 'react';
import { PlayerRole } from '../../types/game.types';
import { cn } from '../../utils/cn';
import { Shield, EyeOff, HelpCircle } from 'lucide-react';

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
  cyan: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  crimson: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  violet: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  slate: 'bg-zinc-800/60 text-zinc-300 border-zinc-700/60',
  outline: 'bg-transparent text-zinc-400 border-zinc-800',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 rounded-md gap-1 font-medium font-mono',
  md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-medium',
  lg: 'text-sm px-3 py-1.5 rounded-xl gap-2 font-semibold',
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
        <span className="relative flex h-1.5 w-1.5 shrink-0 mr-0.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
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
          variant="slate"
          size={size}
          icon={showIcon ? <Shield className="w-3 h-3 text-zinc-400" /> : undefined}
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
          icon={showIcon ? <EyeOff className="w-3 h-3" /> : undefined}
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
          icon={showIcon ? <HelpCircle className="w-3 h-3" /> : undefined}
          className={className}
        >
          {indonesian ? 'Mr. White (Butakata)' : 'Mr. White'}
        </Badge>
      );
    default:
      return null;
  }
};

export interface StatusBadgeProps {
  status: 'alive' | 'eliminated' | 'speaking' | 'voted' | 'host' | 'online' | 'disconnected';
  size?: BadgeSize;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', className }) => {
  switch (status) {
    case 'alive':
      return <Badge variant="emerald" size={size} className={className}>Hidup</Badge>;
    case 'eliminated':
      return <Badge variant="crimson" size={size} className={className}>Gugur</Badge>;
    case 'speaking':
      return <Badge variant="amber" size={size} pulse className={className}>Bicara</Badge>;
    case 'voted':
      return <Badge variant="cyan" size={size} className={className}>Memilih</Badge>;
    case 'host':
      return <Badge variant="amber" size={size} className={className}>Host</Badge>;
    case 'online':
      return <Badge variant="emerald" size={size} className={className}>Online</Badge>;
    case 'disconnected':
      return <Badge variant="slate" size={size} className={className}>Terputus</Badge>;
    default:
      return null;
  }
};
