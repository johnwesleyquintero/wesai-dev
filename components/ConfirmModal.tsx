import React, { useRef, useEffect } from 'react';
import { CloseIcon, AlertTriangleIcon } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'default' | 'destructive';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmVariant = 'default' }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus the cancel button for a safer, more accessible default action.
      cancelButtonRef.current?.focus();
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);


  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                event.preventDefault();
            }
        } else { // Tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                event.preventDefault();
            }
        }
    }
  };

  if (!isOpen) return null;

  const confirmButtonClasses = {
    default: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:opacity-90 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 animate-gradient focus-visible:ring-indigo-500",
    destructive: "bg-red-600 hover:bg-red-700 text-white font-bold transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/40 focus-visible:ring-red-500"
  };

  return (
    <div
      className="fixed inset-0 bg-slate-500/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in transition-opacity duration-normal"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700 animate-scale-in focus:outline-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start">
            {confirmVariant === 'destructive' && <AlertTriangleIcon className="w-6 h-6 text-red-500 dark:text-red-400 mr-4 flex-shrink-0 mt-1" />}
            <div>
                <h2 id="confirm-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">{title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{message}</p>
            </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
            <button
                ref={cancelButtonRef}
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-lg transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800"
            >
                Cancel
            </button>
            <button
                onClick={() => {
                    onConfirm();
                    onClose();
                }}
                className={`py-2 px-4 rounded-lg transition-all duration-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-800 ${confirmButtonClasses[confirmVariant]}`}
            >
                {confirmText}
            </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;