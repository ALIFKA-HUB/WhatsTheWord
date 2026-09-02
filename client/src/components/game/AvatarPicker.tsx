import React from 'react';
import { motion } from 'motion/react';
import { Dices, Check, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useGameSound } from '../../hooks/useGameSound';

export interface AvatarOption {
  id: string;
  emoji: string;
  name: string;
  description: string;
}

export const PRESET_AVATARS: AvatarOption[] = [
  { id: 'cyber-agent', emoji: '🕵️', name: 'Cyber Agent', description: 'Master investigator' },
  { id: 'cyborg', emoji: '🤖', name: 'Cyborg', description: 'Synthetic intellect' },
  { id: 'shadow-fox', emoji: '🦊', name: 'Shadow Fox', description: 'Stealth strategist' },
  { id: 'neon-eagle', emoji: '🦅', name: 'Neon Eagle', description: 'High-altitude scout' },
  { id: 'cyber-wolf', emoji: '🐺', name: 'Cyber Wolf', description: 'Pack tracker' },
  { id: 'stealth-cat', emoji: '🐱', name: 'Stealth Cat', description: 'Silent intruder' },
  { id: 'holo-dragon', emoji: '🐉', name: 'Holo Dragon', description: 'Mythic firewall' },
  { id: 'phantom', emoji: '⚡', name: 'Phantom', description: 'High-speed spark' },
  { id: 'oracle', emoji: '🔮', name: 'Oracle', description: 'Predictive matrix' },
  { id: 'specter', emoji: '🕶️', name: 'Specter', description: 'Hidden operative' },
  { id: 'infiltrator', emoji: '🎭', name: 'Infiltrator', description: 'Deception expert' },
  { id: 'commander', emoji: '👑', name: 'Commander', description: 'Network leader' },
];

const RANDOM_NICKNAMES = [
  'NeonGhost',
  'CyberViper',
  'PhantomX',
  'EchoNine',
  'CipherZero',
  'QuantumFox',
  'ShadowHawk',
  'ByteHunter',
  'NovaAgent',
  'VortexPulse',
  'AeroStrike',
  'SilentGlitch',
];

export interface AvatarPickerProps {
  selectedAvatar: string;
  onSelectAvatar: (avatar: string) => void;
  nickname?: string;
  onNicknameChange?: (nickname: string) => void;
  showNicknameInput?: boolean;
  disabled?: boolean;
  className?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatar,
  onSelectAvatar,
  nickname = '',
  onNicknameChange,
  showNicknameInput = true,
  disabled = false,
  className,
}) => {
  const { playButtonTap } = useGameSound();

  const handleAvatarClick = (avatarEmoji: string) => {
    if (disabled) return;
    try {
      playButtonTap();
    } catch {
      // ignore sound error
    }
    onSelectAvatar(avatarEmoji);
  };

  const handleRandomizeNickname = () => {
    if (disabled || !onNicknameChange) return;
    try {
      playButtonTap();
    } catch {
      // ignore sound error
    }
    const randomName = RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    onNicknameChange(`${randomName}_${randomSuffix}`);
  };

  return (
    <div className={cn('space-y-5', className)}>
      {/* Nickname Input Section */}
      {showNicknameInput && onNicknameChange && (
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5 font-sans">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Nama Agen / Nickname
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              {nickname.length}/15 Karakter
            </span>
          </label>

          <div className="relative flex items-center">
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value.slice(0, 15))}
              placeholder="Masukkan codename agen..."
              disabled={disabled}
              maxLength={15}
              className="w-full pl-4 pr-11 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium transition-all"
            />
            <button
              type="button"
              onClick={handleRandomizeNickname}
              disabled={disabled}
              className="absolute right-2 p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all"
              title="Acak Codename"
              aria-label="Acak Codename"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Avatar Grid Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300 font-sans">
          Pilih Avatar Agen ({PRESET_AVATARS.length} Karakter)
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {PRESET_AVATARS.map((item) => {
            const isSelected = selectedAvatar === item.emoji || selectedAvatar === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
                onClick={() => handleAvatarClick(item.emoji)}
                disabled={disabled}
                className={cn(
                  'relative group flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-150 select-none text-center',
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_20px_-3px_rgba(6,182,212,0.45)] ring-1 ring-cyan-400'
                    : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/80',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                title={`${item.name} - ${item.description}`}
              >
                {/* Active Check Indicator */}
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                {/* Avatar Icon */}
                <span className="text-2xl sm:text-3xl filter drop-shadow-md mb-1 transition-transform group-hover:scale-110">
                  {item.emoji}
                </span>

                {/* Avatar Name */}
                <span
                  className={cn(
                    'text-[10px] sm:text-xs font-semibold truncate w-full tracking-tight',
                    isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  )}
                >
                  {item.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
