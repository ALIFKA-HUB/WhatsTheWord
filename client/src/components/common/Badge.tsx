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

const variantStyles: Record<BadgeVariant, string> = {
  cyan: 'bg-teal-light text-teal-dark border-teal/40',
  crimson: 'bg-stamp-light text-stamp-dark border-stamp/40',
  violet: 'bg-paper-muted text-ink-muted border-rule',
  amber: 'bg-sun-light text-sun-dark border-sun/50',
  emerald: 'bg-teal-light text-teal-dark border-teal/40',
  slate: 'bg-paper-muted text-ink-muted border-rule',
  outline: 'bg-transparent text-ink-muted border-rule',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2.5 py-0.5 rounded-full gap-1 font-semibold',
  md: 'text-xs px-3 py-1 rounded-full gap-1.5 font-semibold',
  lg: 'text-sm px-3.5 py-1.5 rounded-full gap-2 font-semibold',
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
        'inline-flex items-center select-none border transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0 mr-0.5">
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
          variant="emerald"
          size={size}
          icon={showIcon ? <ShieldCheck className="w-3.5 h-3.5 text-teal-dark" weight="bold" /> : undefined}
          className={className}
        >
          {indonesian ? 'Warga' : 'Civilian'}
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
          {indonesian ? 'Impostor' : 'Undercover'}
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
          {indonesian ? 'Mr. White' : 'Mr. White'}
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
      return <Badge variant="emerald" size={size} icon={<CheckCircle className="w-3.5 h-3.5" weight="bold" />} className={className}>Bertahan</Badge>;
    case 'eliminated':
      return <Badge variant="crimson" size={size} icon={<XCircle className="w-3.5 h-3.5" weight="bold" />} className={className}>Gugur</Badge>;
    case 'speaking':
      return <Badge variant="amber" size={size} pulse icon={<Microphone className="w-3.5 h-3.5" weight="bold" />} className={className}>Bicara</Badge>;
    case 'voted':
      return <Badge variant="cyan" size={size} icon={<HandWaving className="w-3.5 h-3.5" weight="bold" />} className={className}>Memilih</Badge>;
    case 'host':
      return <Badge variant="amber" size={size} icon={<Crown className="w-3.5 h-3.5" weight="bold" />} className={className}>Host</Badge>;
    case 'online':
      return <Badge variant="emerald" size={size} icon={<WifiHigh className="w-3.5 h-3.5" weight="bold" />} className={className}>Online</Badge>;
    case 'disconnected':
      return <Badge variant="slate" size={size} icon={<WifiSlash className="w-3.5 h-3.5" weight="bold" />} className={className}>Terputus</Badge>;
    default:
      return null;
  }
};
