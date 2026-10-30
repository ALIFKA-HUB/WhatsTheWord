import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PRESET_AVATARS } from '../game/AvatarPicker';
import { useGameSound } from '../../hooks/useGameSound';
import { cn } from '../../utils/cn';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialAvatar: string;
  onSave: (name: string, avatar: string) => void;
}

const NAME_MAX_LENGTH = 18;

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialAvatar,
  onSave,
}) => {
  const [nickname, setNickname] = useState(initialName);
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const inputRef = useRef<HTMLInputElement>(null);
  const { playButtonTap } = useGameSound();

  // Re-sync local state each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setNickname(initialName);
      setSelectedAvatar(initialAvatar);
      // Focus after the modal spring settles enough to be focusable
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isOpen, initialName, initialAvatar]);

  const canSave = nickname.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    try {
      playButtonTap();
    } catch {
      // ignore sound error
    }
    onSave(nickname.trim(), selectedAvatar);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profil Agen"
      subtitle="Nama dan avatar ini yang tampil di room online."
      size="sm"
    >
      <div className="space-y-5">
        {/* Nickname */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="profile-nickname" className="text-xs font-semibold text-slate-300 font-sans">
              Nama Agen
            </label>
            <span className="text-[10px] font-mono text-slate-500">
              {nickname.length}/{NAME_MAX_LENGTH}
            </span>
          </div>
          <input
            ref={inputRef}
            id="profile-nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, NAME_MAX_LENGTH))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSave();
              }
            }}
            placeholder="Masukkan codename agen..."
            maxLength={NAME_MAX_LENGTH}
            className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/10 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium transition-all"
          />
          {!canSave && (
            <p className="text-[11px] text-slate-500">Nama tidak boleh kosong untuk masuk room.</p>
          )}
        </div>

        {/* Avatar Grid */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-300 font-sans">
            Pilih Avatar
          </span>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_AVATARS.map((item) => {
              const isSelected = selectedAvatar === item.emoji || selectedAvatar === item.id;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    try {
                      playButtonTap();
                    } catch {
                      // ignore sound error
                    }
                    setSelectedAvatar(item.emoji);
                  }}
                  className={cn(
                    'relative group flex flex-col items-center justify-center gap-1 px-1 py-2.5 rounded-xl border transition-all duration-150 select-none text-center',
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400'
                      : 'bg-slate-900/70 border-white/10 hover:border-white/20 hover:bg-slate-800/80'
                  )}
                  title={`${item.name} - ${item.description}`}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <span className="text-2xl filter drop-shadow-md transition-transform group-hover:scale-110">
                    {item.emoji}
                  </span>
                  <span
                    className={cn(
                      'text-[10px] font-semibold truncate w-full tracking-tight',
                      isSelected ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'
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

      {/* Footer inside body: sticky save */}
      <div className="pt-5">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSave}
          disabled={!canSave}
        >
          Simpan Profil
        </Button>
      </div>
    </Modal>
  );
};

export default ProfileModal;
