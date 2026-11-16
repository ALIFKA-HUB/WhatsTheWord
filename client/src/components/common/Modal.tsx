import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from '@phosphor-icons/react';
import { cn } from '../../utils/cn';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl w-full',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}) => {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/50 -z-10"
            onClick={() => closeOnOutsideClick && onClose()}
            aria-hidden="true"
          />

          {/* Dossier dialog card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{
              type: 'spring',
              damping: 26,
              stiffness: 320,
            }}
            className={cn(
              'relative w-full rounded-2xl bg-cardstock border border-rule shadow-print-lg text-ink flex flex-col max-h-[90dvh] overflow-hidden my-auto',
              sizeStyles[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-rule shrink-0 gap-3 bg-cardstock-warm">
                <div className="flex flex-col space-y-0.5 min-w-0 pr-1">
                  {typeof title === 'string' ? (
                    <h2 className="font-condensed text-lg sm:text-xl text-ink leading-tight truncate">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-ink-muted font-sans leading-snug">{subtitle}</p>
                  )}
                </div>

                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full border border-rule bg-cardstock hover:bg-paper-muted active:translate-y-[1px] text-ink flex items-center justify-center shrink-0 transition-colors shadow-print-sm -mr-1 -my-1 touch-manipulation focus-visible:ring-2 focus-visible:ring-ink"
                    aria-label="Tutup Dialog"
                  >
                    <X className="w-4 h-4" weight="bold" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable body with unified overscroll containment */}
            <div className="px-4 py-3.5 sm:px-5 sm:py-4 overflow-y-auto overscroll-contain flex-1 text-ink text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-paper-muted border-t border-rule flex flex-wrap items-center justify-end gap-2.5 sm:gap-3 shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
