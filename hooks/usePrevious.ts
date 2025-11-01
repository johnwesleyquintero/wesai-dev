import { useEffect, useRef } from 'react';

/**
 * A custom hook that returns the value of a variable from the previous render.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
function usePrevious<T>(value: T): T | undefined {
  // Fix: The `useRef` hook requires an initial value. Provide `undefined` and
  // update the generic type to `T | undefined` to correctly type the ref's `current` property.
  const ref = useRef<T | undefined>(undefined);
  
  // Store current value in ref after every render
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  // Return previous value (happens before the update in useEffect)
  return ref.current;
}

export default usePrevious;