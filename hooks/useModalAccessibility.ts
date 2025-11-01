

// FIX: Import React to make the React namespace available for types.
import React, { useRef, useEffect } from 'react';

/**
 * A custom hook to manage modal accessibility features like focus trapping and closing on escape.
 * @param isOpen - Boolean indicating if the modal is open.
 * @param onClose - Callback function to close the modal.
 * @param modalRef - Ref to the modal's root element.
 * @param initialFocusRef - Optional ref to the element that should receive focus when the modal opens.
 */
export const useModalAccessibility = (
  isOpen: boolean,
  onClose: () => void,
  modalRef: React.RefObject<HTMLDivElement>,
  initialFocusRef?: React.RefObject<HTMLElement>
) => {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus the initial element if provided, otherwise the modal itself.
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else {
        modalRef.current?.focus();
      }
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen, initialFocusRef, modalRef]);

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

  // We return the handleKeyDown function so it can be attached to the modal's onKeyDown event.
  return { handleKeyDown };
};