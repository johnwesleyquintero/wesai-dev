import { useState, useEffect } from 'react';

// A custom hook to persist state in localStorage
function usePersistentState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
    } catch (error) {
      console.error(`Error parsing localStorage key "${key}":`, error);
    }
    return initialValue;
  });

  useEffect(() => {
    try {
        if (state === null || state === undefined) {
             localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, JSON.stringify(state));
        }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;
