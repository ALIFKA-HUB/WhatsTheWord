import React, { useState, useEffect, useRef } from 'react';

import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PlayerToken } from '../game/PlayerToken';
import { AvatarPicker } from '../game/AvatarPicker';
import { PRESET_TOKEN_AVATARS } from '../../utils/avatarTokens';
import { useGameSound } from '../../hooks/useGameSound';


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
      subtitle="Nama dan token ini yang tampil di meja online."
      size="sm"
    >
      <div className="space-y-5">
        {/* Token preview */}
        <div className="flex items-center gap-4 p-3 rounded-xl border border-rule bg-paper">
          <PlayerToken avatar={selectedAvatar} name={nickname} size="lg" showCode={false} />
          <div className="min-w-0">
            <p className="font-condensed text-xl text-ink truncate">{nickname || 'Agen'}</p>
            <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink-muted">
              Token:{' '}
              {PRESET_TOKEN_AVATARS.find((t) => t.id === selectedAvatar)?.name || 'Mata Elang'}
            </p>
          </div>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="profile-nickname" className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
              Nama Agen
            </label>
            <span className="text-[11px] font-mono text-ink-muted">
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
            placeholder="Tulis codename..."
            maxLength={NAME_MAX_LENGTH}
            className="w-full px-4 py-2.5 bg-cardstock border border-rule rounded-xl text-ink placeholder:text-ink-faint focus:outline-none focus:border-teal focus:ring-2 focus:ring-teal/30 text-sm font-semibold transition-all"
          />
          {!canSave && (
            <p className="text-[11px] font-mono font-bold uppercase tracking-wide text-stamp-dark">
              Nama tidak boleh kosong
            </p>
          )}
        </div>

        {/* Token grid via AvatarPicker (nickname input hidden, token grid only) */}
        <AvatarPicker
          selectedAvatar={selectedAvatar}
          onSelectAvatar={setSelectedAvatar}
          showNicknameInput={false}
        />
      </div>

      {/* Save button */}
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
