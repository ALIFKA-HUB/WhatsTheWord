import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md -z-10"
            onClick={() => closeOnOutsideClick && onClose()}
            aria-hidden="true"
          />

          {/* Modal Dialog Content */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 320,
            }}
            className={cn(
              'relative w-full rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl shadow-cyan-950/40 text-slate-100 flex flex-col max-h-[90dvh] overflow-hidden my-auto',
              sizeStyles[size],
              className
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between px-6 py-4 border-b border-white/10 shrink-0 gap-4">
                <div className="flex flex-col space-y-1">
                  {typeof title === 'string' ? (
                    <h2 className="text-lg sm:text-xl font-bold font-display text-slate-100">
                      {title}
                    </h2>
                  ) : (
                    title
                  )}
                  {subtitle && (
                    <p className="text-xs sm:text-sm text-slate-400 font-sans">{subtitle}</p>
                  )}
                </div>

                {showCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-100 -mr-2 -mt-1 h-8 w-8 rounded-lg"
                    aria-label="Tutup Dialog"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Scrollable Body */}
            <div className="px-6 py-5 overflow-y-auto flex-1 text-slate-200 text-sm leading-relaxed">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 bg-slate-950/40 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
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
