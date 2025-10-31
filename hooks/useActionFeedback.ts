import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * A custom hook to provide temporary visual feedback after an action.
 * @param duration The duration in milliseconds for the feedback to be visible.
 * @returns An object with `isActionDone` boolean state and a `trigger` function.
 */
export const useActionFeedback = (duration: number = 2000) => {
  const [isActionDone, setIsActionDone] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const trigger = useCallback(() => {
    // Clear any existing timeout to handle rapid clicks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsActionDone(true);

    timeoutRef.current = window.setTimeout(() => {
      setIsActionDone(false);
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isActionDone, trigger };
};
