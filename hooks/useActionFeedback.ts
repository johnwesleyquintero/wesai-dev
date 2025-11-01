import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * A custom hook to provide temporary visual feedback after an action.
 * @param duration The duration in milliseconds for the feedback to be visible.
 * @returns An object with `isActionDone` boolean state and a `trigger` function.
 */
export const useActionFeedback = (duration: number = 2000) => {
  const [isActionDone, setIsActionDone] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true); // Add ref to track mounted state.

  const trigger = useCallback(() => {
    // Clear any existing timeout to handle rapid clicks
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsActionDone(true);

    timeoutRef.current = setTimeout(() => {
      // Fortification: Only update state if the component is still mounted.
      if (mountedRef.current) {
        setIsActionDone(false);
      }
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  // On unmount, clear any pending timeout and update the mounted ref.
  useEffect(() => {
    mountedRef.current = true; // Set on mount
    return () => {
      mountedRef.current = false; // Set on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isActionDone, trigger };
};