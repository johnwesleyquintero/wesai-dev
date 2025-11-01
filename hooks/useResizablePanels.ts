import { useState, useCallback, useEffect, useRef } from 'react';
import { PANEL_DEFAULT_SIZE_PERCENT, PANEL_MIN_SIZE_PERCENT, PANEL_MAX_SIZE_PERCENT, LOCAL_STORAGE_KEYS } from '../constants';

// Helper to safely get the initial position from localStorage
const getInitialPosition = (): number => {
    try {
        const storedValue = localStorage.getItem(LOCAL_STORAGE_KEYS.DIVIDER_POSITION);
        if (storedValue) {
            const parsed = JSON.parse(storedValue);
            // Add validation to ensure the stored value is within bounds
            if (typeof parsed === 'number' && parsed >= PANEL_MIN_SIZE_PERCENT && parsed <= PANEL_MAX_SIZE_PERCENT) {
                return parsed;
            }
        }
    } catch (error) {
        // Suppress client-side errors
    }
    return PANEL_DEFAULT_SIZE_PERCENT;
};

export const useResizablePanels = (mainContainerRef: React.RefObject<HTMLDivElement>) => {
    const [dividerPosition, setDividerPosition] = useState<number>(getInitialPosition);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    // Use a ref to store the latest position for persisting, avoiding re-triggering effects.
    const positionRef = useRef<number>(dividerPosition);

    // Keep the ref updated with the latest state value.
    useEffect(() => {
        positionRef.current = dividerPosition;
    }, [dividerPosition]);

    // Apply the width to the panel via CSS custom property.
    useEffect(() => {
        if (mainContainerRef.current) {
            mainContainerRef.current.style.setProperty('--panel-one-basis', `${dividerPosition}%`);
        }
    }, [dividerPosition, mainContainerRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    // Memoize mouse move handler. It will only update the state.
    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!mainContainerRef.current) return;

        const containerRect = mainContainerRef.current.getBoundingClientRect();
        if (containerRect.width === 0) return;

        const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const clampedPosition = Math.max(PANEL_MIN_SIZE_PERCENT, Math.min(PANEL_MAX_SIZE_PERCENT, newPosition));

        setDividerPosition(clampedPosition);
    }, [mainContainerRef]);

    // Memoize mouse up handler. It will stop the drag and persist the final value.
    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Effect to add and remove global event listeners based on dragging state.
    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // This effect handles the side-effects of dragging, like cursor changes and persisting the final state.
    useEffect(() => {
        const previewIframe = document.querySelector('iframe[title="Component Preview"]') as HTMLIFrameElement | null;
        if (isDragging) {
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            if (previewIframe) {
                previewIframe.style.pointerEvents = 'none';
            }
        } else {
            // This block runs when dragging stops.
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (previewIframe) {
                previewIframe.style.pointerEvents = 'auto';
            }
            // Persist the final position to localStorage.
            try {
                localStorage.setItem(LOCAL_STORAGE_KEYS.DIVIDER_POSITION, JSON.stringify(positionRef.current));
            } catch (error) {
                // Suppress client-side errors
            }
        }
    }, [isDragging]);


    // Keyboard navigation for the divider.
    const handleDividerKeyDown = useCallback((e: React.KeyboardEvent) => {
        let newPosition: number | null = null;
        const step = (e.shiftKey) ? 10 : 1; // Allow faster movement with Shift key

        const currentPosition = positionRef.current;

        if (e.key === 'ArrowLeft') {
            newPosition = Math.max(PANEL_MIN_SIZE_PERCENT, currentPosition - step);
        } else if (e.key === 'ArrowRight') {
            newPosition = Math.min(PANEL_MAX_SIZE_PERCENT, currentPosition + step);
        } else if (e.key === 'Home') {
            newPosition = PANEL_MIN_SIZE_PERCENT;
        } else if (e.key === 'End') {
            newPosition = PANEL_MAX_SIZE_PERCENT;
        }

        if (newPosition !== null) {
            e.preventDefault();
            setDividerPosition(newPosition);
            // Persist immediately for keyboard changes.
            try {
                localStorage.setItem(LOCAL_STORAGE_KEYS.DIVIDER_POSITION, JSON.stringify(newPosition));
            } catch (error) {
                // Suppress client-side errors
            }
        }
    }, []);

    // Function for external updates (e.g., reset button).
    const setPosition = useCallback((newPosition: number) => {
        const clampedPosition = Math.max(PANEL_MIN_SIZE_PERCENT, Math.min(PANEL_MAX_SIZE_PERCENT, newPosition));
        setDividerPosition(clampedPosition);
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.DIVIDER_POSITION, JSON.stringify(clampedPosition));
        } catch (error) {
            // Suppress client-side errors
        }
    }, []);

    return {
        dividerPosition,
        setDividerPosition: setPosition, // Expose the external update function
        isDragging,
        handleMouseDown,
        handleDividerKeyDown,
    };
};
