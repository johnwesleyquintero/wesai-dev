import { useState, useEffect, useRef } from 'react';
import { RESET_ANIMATION_DURATION_MS } from '../constants';

/**
 * A custom hook to cycle through an array of items at a given interval
 * with a fade-in/out animation effect.
 * @param items The array of items to cycle through.
 * @param interval The interval duration in milliseconds.
 * @returns An object with the `currentItem` and a boolean `isVisible`.
 */
export const useCyclingItems = <T,>(items: T[], interval: number) => {
  // State to hold the index of the currently displayed item.
  const [currentIndex, setCurrentIndex] = useState(0);
  // State to control the visibility for fade animations.
  const [isVisible, setIsVisible] = useState(true);
  // Ref to manage the timeout for the fade-in part of the cycle.
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect to select a random starting item on initial mount.
  useEffect(() => {
    if (items.length > 0) {
      setCurrentIndex(Math.floor(Math.random() * items.length));
    }
  }, [items.length]);

  // The main effect for handling the cycling interval.
  useEffect(() => {
    if (items.length === 0) return;

    // Set up the interval to trigger the cycling logic.
    const cycleInterval = setInterval(() => {
      // Step 1: Fade out the current item.
      setIsVisible(false);
      
      // Step 2: After the fade-out animation completes, update the item and fade it back in.
      timeoutIdRef.current = setTimeout(() => {
        // This check prevents state updates on an unmounted component.
        if (timeoutIdRef.current !== null) { 
            setCurrentIndex(prevIndex => (prevIndex + 1) % items.length);
            setIsVisible(true);
        }
      }, RESET_ANIMATION_DURATION_MS);

    }, interval);

    // Cleanup function to clear the interval and any pending timeout on component unmount.
    return () => {
      clearInterval(cycleInterval);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null; // Prevent stale timeout from running
      }
    };
  }, [items, interval]); // Re-run effect if items or interval change.

  return {
    currentItem: items[currentIndex],
    isVisible,
  };
};
