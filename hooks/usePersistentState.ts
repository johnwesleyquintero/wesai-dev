
// FIX: Import React to make the React namespace available for types.
import React, { useState, useEffect } from 'react';

// A custom hook to persist state in localStorage
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    // Prevent SSR errors by checking for 'window'
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const storedValue = window.localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    // Prevent SSR errors by checking for 'window'
    if (typeof window === 'undefined') {
      return;
    }
    try {
        if (state === null || state === undefined) {
             window.localStorage.removeItem(key);
        } else {
            window.localStorage.setItem(key, JSON.stringify(state));
        }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;
