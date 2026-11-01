import React from 'react';
import { PlayerRole } from '../../types/game.types';
import { ShieldCheck, Detective, Question, Crown, CheckCircle, XCircle, Microphone, HandWaving, WifiHigh, WifiSlash } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

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

/* Print palette: variants map to ink / stamp / paper treatments */
const variantStyles: Record<BadgeVariant, string> = {
  cyan: 'bg-cardstock text-ink border-ink',
  crimson: 'bg-stamp-light text-stamp-dark border-stamp',
  violet: 'bg-paper-muted text-ink-muted border-dashed border-ink',
  amber: 'bg-cardstock text-ink border-ink shadow-print-sm',
  emerald: 'bg-cardstock text-ink border-ink',
  slate: 'bg-paper-muted text-ink-muted border-rule',
  outline: 'bg-transparent text-ink-muted border-rule',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[11px] px-2 py-0.5 rounded-lg gap-1 font-bold font-mono uppercase tracking-wider',
  md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-bold font-mono uppercase tracking-wider',
  lg: 'text-sm px-3 py-1.5 rounded-xl gap-2 font-bold font-mono uppercase tracking-wider',
};

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'slate',
  size = 'md',
  pulse = false,
  icon,
  children,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center select-none border-2 transition-all',
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
          icon={showIcon ? <ShieldCheck className="w-3.5 h-3.5 text-ink" weight="bold" /> : undefined}
          className={className}
        >
          {indonesian ? 'WARGA' : 'Civilian'}
        </Badge>
      );
    case 'UNDERCOVER':
      return (
        <Badge
          variant="crimson"
          size={size}
          icon={showIcon ? <Detective className="w-3.5 h-3.5 text-stamp-dark" weight="bold" /> : undefined}
          className={className}
        >
          {indonesian ? 'IMPOSTOR' : 'Undercover'}
        </Badge>
      );
    case 'MR_WHITE':
      return (
        <Badge
          variant="violet"
          size={size}
          icon={showIcon ? <Question className="w-3.5 h-3.5 text-ink-muted" weight="bold" /> : undefined}
          className={className}
        >
          {indonesian ? 'MR. WHITE' : 'Mr. White'}
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
      return <Badge variant="emerald" size={size} icon={<CheckCircle className="w-3.5 h-3.5" weight="bold" />} className={className}>BERTAHAN</Badge>;
    case 'eliminated':
      return <Badge variant="crimson" size={size} icon={<XCircle className="w-3.5 h-3.5" weight="bold" />} className={className}>GUGUR</Badge>;
    case 'speaking':
      return <Badge variant="amber" size={size} pulse icon={<Microphone className="w-3.5 h-3.5" weight="bold" />} className={className}>BICARA</Badge>;
    case 'voted':
      return <Badge variant="cyan" size={size} icon={<HandWaving className="w-3.5 h-3.5" weight="bold" />} className={className}>MEMILIH</Badge>;
    case 'host':
      return <Badge variant="amber" size={size} icon={<Crown className="w-3.5 h-3.5" weight="bold" />} className={className}>HOST</Badge>;
    case 'online':
      return <Badge variant="emerald" size={size} icon={<WifiHigh className="w-3.5 h-3.5" weight="bold" />} className={className}>ONLINE</Badge>;
    case 'disconnected':
      return <Badge variant="slate" size={size} icon={<WifiSlash className="w-3.5 h-3.5" weight="bold" />} className={className}>TERPUTUS</Badge>;
    default:
      return null;
  }
};
