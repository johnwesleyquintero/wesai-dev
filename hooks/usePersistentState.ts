// FIX: Import React to make the React namespace available for types.
import React, { useState, useEffect, useCallback } from 'react';

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

  // Effect to write state changes from the current tab to localStorage.
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

  // Callback to handle storage events from other tabs.
  const handleStorageChange = useCallback((event: StorageEvent) => {
    if (event.key === key) {
        try {
            if (event.newValue) {
                // The value from another tab has changed. Update our state.
                setState(JSON.parse(event.newValue));
            } else {
                // The item was removed from storage in another tab. Reset to initial value.
                setState(initialValue);
            }
        } catch (error) {
            console.error(`Error parsing storage change for key "${key}":`, error);
            setState(initialValue); // Reset to initial on error for safety.
        }
    }
  }, [key, initialValue]);

  // Effect to listen for storage changes from other tabs.
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleStorageChange]);


  return [state, setState];
}

export default usePersistentState;