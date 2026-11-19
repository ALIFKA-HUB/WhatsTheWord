import React from 'react';
import { Crown } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';
import { resolveTokenAvatar, type TokenIconKey } from '../../utils/avatarTokens';

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

const SIZE_STYLES: Record<
  NonNullable<PlayerTokenProps['size']>,
  { box: string; code: string; badge: string }
> = {
  xs: { box: 'w-8 h-8 rounded-xl', code: 'text-[6px]', badge: 'w-4 h-4 -top-1 -right-1' },
  sm: { box: 'w-11 h-11 rounded-2xl', code: 'text-[7px]', badge: 'w-4 h-4 -top-1 -right-1' },
  md: { box: 'w-14 h-14 rounded-2xl', code: 'text-[8px]', badge: 'w-5 h-5 -top-1.5 -right-1.5' },
  lg: { box: 'w-20 h-20 rounded-3xl', code: 'text-[10px]', badge: 'w-6 h-6 -top-1.5 -right-1.5' },
  xl: { box: 'w-28 h-28 rounded-3xl', code: 'text-xs', badge: 'w-7 h-7 -top-2 -right-2' },
};

interface PaletteTheme {
  bg: string;
  halo: string;
  coat: string;
  accent: string;
  skin: string;
  ink: string;
}

/**
 * Four harmonious Hum tabletop portrait palettes (Sage Teal, Sun Ochre, Terracotta Stamp, Warm Sand).
 */
const HUM_PALETTES: Record<'teal' | 'sun' | 'stamp' | 'sand', PaletteTheme> = {
  teal: {
    bg: '#DCEFE9',
    halo: '#B9E2D6',
    coat: '#1E5E4C',
    accent: '#E5B842',
    skin: '#FCFBF7',
    ink: '#1E242B',
  },
  sun: {
    bg: '#F9ECC8',
    halo: '#F2DC9C',
    coat: '#8A5A10',
    accent: '#2E7D67',
    skin: '#FCFBF7',
    ink: '#1E242B',
  },
  stamp: {
    bg: '#FADFD8',
    halo: '#F4C4B8',
    coat: '#A13A24',
    accent: '#E5B842',
    skin: '#FCFBF7',
    ink: '#1E242B',
  },
  sand: {
    bg: '#EAE4D3',
    halo: '#DDD4BE',
    coat: '#28303D',
    accent: '#C9563C',
    skin: '#FCFBF7',
    ink: '#1E242B',
  },
};

const ICON_THEME_MAP: Record<TokenIconKey, keyof typeof HUM_PALETTES> = {
  eye: 'teal',
  detective: 'sand',
  compass: 'sun',
  key: 'stamp',
  lightning: 'sun',
  crown: 'teal',
  skull: 'sand',
  star: 'stamp',
  crosshair: 'teal',
  fingerprint: 'sun',
  flame: 'stamp',
  spade: 'sand',
};

/**
 * Cohesive illustrated board-game character bust SVG rendered in the Hum palette.
 * Every avatar has the same portrait framing, shoulders, head, and distinct character headgear/accessory.
 */
const CharacterPortraitSvg: React.FC<{ iconKey: TokenIconKey; palette: PaletteTheme }> = ({
  iconKey,
  palette,
}) => {
  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full block"
      aria-hidden="true"
      focusable="false"
    >
      {/* Background & soft circular studio halo */}
      <rect width="64" height="64" fill={palette.bg} />
      <circle cx="32" cy="30" r="22" fill={palette.halo} />

      {/* Shoulders / Coat */}
      <path
        d="M10 64 C10 47, 20 43, 32 43 C44 43, 54 47, 54 64 Z"
        fill={palette.coat}
        stroke={palette.ink}
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Collar V-neck */}
      <path
        d="M25 44 L32 53 L39 44"
        fill={palette.skin}
        stroke={palette.ink}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Lapel / Tie accent */}
      <circle cx="32" cy="56" r="2.5" fill={palette.accent} />

      {/* Neck & Head */}
      <rect x="28" y="36" width="8" height="9" rx="3" fill={palette.skin} stroke={palette.ink} strokeWidth="2" />
      <circle
        cx="32"
        cy="27"
        r="12.5"
        fill={palette.skin}
        stroke={palette.ink}
        strokeWidth="2.2"
      />

      {/* Base Face Expression (Eyes & Smile) */}
      <circle cx="27.5" cy="27.5" r="1.6" fill={palette.ink} />
      <circle cx="36.5" cy="27.5" r="1.6" fill={palette.ink} />
      <path
        d="M28.5 32.5 Q32 35 35.5 32.5"
        fill="none"
        stroke={palette.ink}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Distinct Character Headgear & Accessories per Preset */}
      {iconKey === 'eye' && (
        <>
          {/* Monocle & Beret */}
          <circle cx="36.5" cy="27.5" r="4.5" fill="none" stroke={palette.accent} strokeWidth="2" />
          <path d="M18 19 C20 11, 44 11, 47 18 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
        </>
      )}

      {iconKey === 'detective' && (
        <>
          {/* Classic Detective Fedora */}
          <path d="M14 19 L50 19" stroke={palette.ink} strokeWidth="3" strokeLinecap="round" />
          <path d="M20 19 C21 10, 43 10, 44 19 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <rect x="21" y="16" width="22" height="3" fill={palette.accent} />
        </>
      )}

      {iconKey === 'compass' && (
        <>
          {/* Explorer Cap & Bandana */}
          <path d="M18 18 C20 10, 44 10, 46 18 L51 19 L18 19 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <circle cx="32" cy="14" r="2.2" fill={palette.accent} />
        </>
      )}

      {iconKey === 'key' && (
        <>
          {/* Round Scholar Glasses & Hair Bangs */}
          <circle cx="27" cy="27.5" r="4" fill="none" stroke={palette.ink} strokeWidth="1.8" />
          <circle cx="37" cy="27.5" r="4" fill="none" stroke={palette.ink} strokeWidth="1.8" />
          <line x1="31" y1="27.5" x2="33" y2="27.5" stroke={palette.ink} strokeWidth="1.8" />
          <path d="M19 22 C20 12, 44 12, 45 22 C39 17, 25 17, 19 22 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
        </>
      )}

      {iconKey === 'lightning' && (
        <>
          {/* Sporty Visor & Lightning Hair Crest */}
          <path d="M19 20 C22 11, 42 11, 45 20 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <path d="M31 11 L28 17 L33 17 L30 22" fill="none" stroke={palette.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}

      {iconKey === 'crown' && (
        <>
          {/* Royal Crown Headpiece */}
          <path
            d="M20 19 L22 10 L28 15 L32 9 L36 15 L42 10 L44 19 Z"
            fill={palette.accent}
            stroke={palette.ink}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </>
      )}

      {iconKey === 'skull' && (
        <>
          {/* Mysterious Domino Mask & Hood */}
          <rect x="22" y="24" width="20" height="6.5" rx="3.2" fill={palette.coat} stroke={palette.ink} strokeWidth="1.8" />
          <circle cx="27.5" cy="27.2" r="1.7" fill={palette.skin} />
          <circle cx="36.5" cy="27.2" r="1.7" fill={palette.skin} />
          <path d="M17 24 C17 11, 47 11, 47 24" fill="none" stroke={palette.coat} strokeWidth="4" strokeLinecap="round" />
        </>
      )}

      {iconKey === 'star' && (
        <>
          {/* Cool Shades & Star Beret */}
          <rect x="22" y="24.5" width="9" height="5" rx="1.5" fill={palette.ink} />
          <rect x="33" y="24.5" width="9" height="5" rx="1.5" fill={palette.ink} />
          <line x1="31" y1="26" x2="33" y2="26" stroke={palette.ink} strokeWidth="2" />
          <path d="M19 18 C22 10, 43 10, 46 19 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <circle cx="32" cy="14.5" r="2.3" fill={palette.accent} />
        </>
      )}

      {iconKey === 'crosshair' && (
        <>
          {/* Tactician Beret & Scope Visor */}
          <path d="M18 19 C19 11, 43 9, 47 17 L18 19 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <circle cx="27.5" cy="27.5" r="4.2" fill="none" stroke={palette.accent} strokeWidth="2" />
          <line x1="27.5" y1="22" x2="27.5" y2="24" stroke={palette.accent} strokeWidth="1.8" />
        </>
      )}

      {iconKey === 'fingerprint' && (
        <>
          {/* Forensic Goggles on Forehead */}
          <path d="M19 20 C21 11, 43 11, 45 20 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <circle cx="27" cy="17.5" r="3.5" fill={palette.accent} stroke={palette.ink} strokeWidth="1.8" />
          <circle cx="37" cy="17.5" r="3.5" fill={palette.accent} stroke={palette.ink} strokeWidth="1.8" />
        </>
      )}

      {iconKey === 'flame' && (
        <>
          {/* Warm Beanie Cap with Badge */}
          <path d="M19 20 C19 10, 45 10, 45 20 Z" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <rect x="18" y="17.5" width="28" height="4" rx="2" fill={palette.accent} stroke={palette.ink} strokeWidth="1.8" />
        </>
      )}

      {iconKey === 'spade' && (
        <>
          {/* Gentleman Top Hat */}
          <rect x="22" y="8" width="20" height="11" rx="2" fill={palette.coat} stroke={palette.ink} strokeWidth="2" />
          <line x1="16" y1="19" x2="48" y2="19" stroke={palette.ink} strokeWidth="3" strokeLinecap="round" />
          <rect x="22" y="15.5" width="20" height="3" fill={palette.accent} />
        </>
      )}
    </svg>
  );
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
  const s = SIZE_STYLES[size];
  const themeKey = ICON_THEME_MAP[token.iconKey] || 'teal';
  const palette = HUM_PALETTES[themeKey];

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 border-2 select-none shadow-print-sm',
        s.box,
        selected && !eliminated
          ? 'border-teal-dark ring-2 ring-teal'
          : 'border-rule',
        eliminated && 'opacity-50 grayscale',
        className
      )}
      title={`${token.name} (${token.description})`}
      aria-label={name ? `Pion ${name}` : `Pion ${token.name}`}
    >
      <div className="w-full h-full overflow-hidden rounded-[inherit]">
        <CharacterPortraitSvg iconKey={token.iconKey} palette={palette} />
      </div>

      {/* Corner catalog code */}
      {showCode && size !== 'xs' && (
        <span
          className={cn(
            'absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md bg-cardstock border border-rule font-mono font-bold leading-none text-ink shadow-print-sm',
            s.code,
            eliminated && 'opacity-40'
          )}
        >
          {token.code}
        </span>
      )}

      {/* Host crown badge */}
      {isHost && !eliminated && (
        <span
          className={cn(
            'absolute rounded-full bg-sun text-ink flex items-center justify-center border-2 border-cardstock shadow-print-sm',
            s.badge
          )}
          title="Pemilik Meja (Host)"
        >
          <Crown className="w-3 h-3" weight="bold" aria-hidden="true" />
        </span>
      )}

      {/* Eliminated strike */}
      {eliminated && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute w-[110%] h-[3px] bg-stamp -rotate-45 rounded-full" />
          <span className="absolute w-[110%] h-[3px] bg-stamp rotate-45 rounded-full" />
        </span>
      )}
    </div>
  );
};

export default PlayerToken;
