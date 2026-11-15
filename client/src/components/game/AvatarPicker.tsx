import React from 'react';
import { motion } from 'motion/react';
import { Shuffle, Check } from '@phosphor-icons/react';
import { PlayerToken } from './PlayerToken';
import { PRESET_TOKEN_AVATARS } from '../../utils/avatarTokens';
import { cn } from '../../utils/cn';
import { useGameSound } from '../../hooks/useGameSound';

export interface AvatarOption {
  id: string;
  /* token id kept in the emoji field so existing callers (roster persistence,
     server payloads) keep receiving a stable string value */
  emoji: string;
  name: string;
  description: string;
}

export const PRESET_AVATARS: AvatarOption[] = PRESET_TOKEN_AVATARS.map((t) => ({
  id: t.id,
  emoji: t.id,
  name: t.name,
  description: t.description,
}));

const RANDOM_NICKNAMES = [
  'Saksi_Meja',
  'Bung_Kartu',
  'Detektif_Senja',
  'Tuan_Tinta',
  'Nona_Sandi',
  'Hakim_Garis',
  'Kurir_Kertas',
  'Penjaga_Pos',
  'Agen_Merah',
  'Juru_Arsip',
  'Kapten_Dadu',
  'Saudagar_Kata',
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

  const handleAvatarClick = (avatarId: string) => {
    if (disabled) return;
    try {
      playButtonTap();
    } catch {
      // ignore sound error
    }
    onSelectAvatar(avatarId);
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
          <label className="flex items-center justify-between text-xs font-semibold text-ink">
            <span>Nama Pemain</span>
            <span className="text-xs text-ink-muted font-normal">
              {nickname.length}/15
            </span>
          </label>

          <div className="relative flex items-center">
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value.slice(0, 15))}
              placeholder="Tulis nama panggilan…"
              disabled={disabled}
              maxLength={15}
              className="w-full pl-4 pr-12 py-2.5 bg-cardstock border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:border-teal-dark focus:ring-2 focus:ring-teal text-sm font-semibold transition-colors"
            />
            <button
              type="button"
              onClick={handleRandomizeNickname}
              disabled={disabled}
              className="absolute right-2 p-1.5 rounded-lg border border-rule bg-paper-muted/60 text-ink hover:bg-paper-muted active:translate-y-[1px] transition-colors"
              title="Acak Nama"
              aria-label="Acak Nama"
            >
              <Shuffle className="w-4 h-4" weight="bold" />
            </button>
          </div>
        </div>
      )}

      {/* Token Grid Selection */}
      <div className="space-y-2">
        <span className="block text-xs font-semibold text-ink">
          Pilih Pion ({PRESET_AVATARS.length})
        </span>

        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
          {PRESET_AVATARS.map((item) => {
            const isSelected = selectedAvatar === item.emoji || selectedAvatar === item.id;

            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: disabled ? 1 : 0.96 }}
                onClick={() => handleAvatarClick(item.emoji)}
                disabled={disabled}
                className={cn(
                  'relative group flex flex-col items-center justify-center gap-1.5 px-1.5 py-2.5 rounded-2xl border transition-colors select-none text-center',
                  isSelected
                    ? 'border-teal-dark bg-teal-light shadow-print-sm'
                    : 'border-rule bg-cardstock hover:bg-paper-muted/70 shadow-print-sm',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                title={`${item.name} - ${item.description}`}
                aria-pressed={isSelected}
              >
                {isSelected && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-teal-dark text-cardstock border border-cardstock flex items-center justify-center z-10">
                    <Check className="w-3 h-3" weight="bold" />
                  </span>
                )}

                <PlayerToken
                  avatar={item.emoji}
                  name={item.name}
                  size="sm"
                  showCode={false}
                  selected={isSelected}
                />

                <span
                  className={cn(
                    'text-xs font-semibold truncate w-full',
                    isSelected ? 'text-teal-dark' : 'text-ink-muted group-hover:text-ink'
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
