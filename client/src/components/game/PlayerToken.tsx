import React from 'react';
import {
  Eye,
  Detective,
  Compass,
  Key,
  Lightning,
  Crown,
  Skull,
  Star,
  Crosshair,
  Fingerprint,
  Flame,
  Spade,
} from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { resolveTokenAvatar, type TokenShape } from '../../utils/avatarTokens';

const ICONS = {
  eye: Eye,
  detective: Detective,
  compass: Compass,
  key: Key,
  lightning: Lightning,
  crown: Crown,
  skull: Skull,
  star: Star,
  crosshair: Crosshair,
  fingerprint: Fingerprint,
  flame: Flame,
  spade: Spade,
} as const;

const SHAPES: Record<TokenShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-xl',
  diamond: 'rotate-45 rounded-xl',
  triangle: 'rounded-xl',
  hexagon: 'rounded-2xl',
  octagon: 'rounded-2xl',
  shield: 'rounded-t-full rounded-b-lg',
  ticket: 'rounded-xl border-dashed',
  stamp: 'rounded-full border-dashed',
  badge: 'rounded-[30%] rounded-tl-none',
  crest: 'rounded-t-[40%] rounded-b-md',
  seal: 'rounded-full border-double border-4',
};

export interface PlayerTokenProps {
  avatar?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  eliminated?: boolean;
  selected?: boolean;
  isHost?: boolean;
  showCode?: boolean;
  className?: string;
}

const SIZE_STYLES: Record<NonNullable<PlayerTokenProps['size']>, { box: string; icon: string; code: string; initials: string }> = {
  xs: { box: 'w-8 h-8', icon: 'w-3.5 h-3.5', code: 'text-[6px]', initials: 'text-[11px]' },
  sm: { box: 'w-10 h-10', icon: 'w-4 h-4', code: 'text-[7px]', initials: 'text-[11px]' },
  md: { box: 'w-14 h-14', icon: 'w-5 h-5', code: 'text-[8px]', initials: 'text-sm' },
  lg: { box: 'w-20 h-20', icon: 'w-7 h-7', code: 'text-[11px]', initials: 'text-xl' },
  xl: { box: 'w-28 h-28', icon: 'w-10 h-10', code: 'text-xs', initials: 'text-3xl' },
};

export const PlayerToken: React.FC<PlayerTokenProps> = ({
  avatar,
  name,
  size = 'md',
  eliminated = false,
  selected = false,
  isHost = false,
  showCode = true,
  className,
}) => {
  const token = resolveTokenAvatar(avatar, name);
  const Icon = ICONS[token.iconKey];
  const s = SIZE_STYLES[size];
  const accent = selected || token.accentInverted;

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 border border-rule select-none',
        SHAPES[token.shape],
        s.box,
        accent && !eliminated && 'bg-stamp text-ink border-ink',
        !accent && !eliminated && 'bg-cardstock text-ink halftone-dots bg-blend-normal',
        eliminated && 'bg-paper-muted text-ink-faint border-rule',
        className
      )}
      style={accent && !eliminated ? { backgroundImage: 'none' } : undefined}
      title={`${token.name} - ${token.description}`}
      aria-label={name ? `Token ${name}` : `Token ${token.name}`}
    >
      {/* halftone texture only on light tokens */}
      {!accent && !eliminated && (
        <span className="absolute inset-0 halftone-dots opacity-[0.12] pointer-events-none rounded-[inherit]" />
      )}

      {/* content: icon on top, initials below (md and larger) */}
      <span className={cn('relative z-10 flex flex-col items-center justify-center leading-none gap-0.5', token.shape === 'diamond' && '-rotate-45')}>
        <Icon className={s.icon} weight="bold" aria-hidden="true" />
        {size !== 'xs' && size !== 'sm' && (
          <span className={cn('font-condensed tracking-tight', s.initials)}>{token.initials}</span>
        )}
      </span>

      {/* corner catalog code */}
      {showCode && size !== 'xs' && (
        <span
          className={cn(
            'absolute -top-1.5 -left-1.5 px-1 bg-cardstock border border-rule font-mono font-bold leading-none',
            s.code,
            eliminated && 'opacity-40'
          )}
        >
          {token.code}
        </span>
      )}

      {/* host star */}
      {isHost && !eliminated && (
        <span
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-teal text-ink flex items-center justify-center border-2 border-cardstock"
          title="Room Host"
        >
          <Crown className="w-3 h-3" weight="bold" aria-hidden="true" />
        </span>
      )}

      {/* eliminated strike */}
      {eliminated && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute w-[120%] h-[3px] bg-stamp -rotate-45" />
          <span className="absolute w-[120%] h-[3px] bg-stamp rotate-45" />
        </span>
      )}
    </div>
  );
};

export default PlayerToken;
