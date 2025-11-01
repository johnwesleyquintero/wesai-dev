import { useState, useCallback, useEffect } from 'react';
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

    // Centralized Persistence: This effect runs whenever the position changes for any reason.
    useEffect(() => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEYS.DIVIDER_POSITION, JSON.stringify(dividerPosition));
        } catch (error) {
            // Suppress client-side errors and log for debugging if needed
        }
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

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!mainContainerRef.current) return;
        const containerRect = mainContainerRef.current.getBoundingClientRect();
        if (containerRect.width === 0) return;
        const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        const clampedPosition = Math.max(PANEL_MIN_SIZE_PERCENT, Math.min(PANEL_MAX_SIZE_PERCENT, newPosition));
        setDividerPosition(clampedPosition);
    }, [mainContainerRef]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Consolidated effect for managing drag listeners and side-effects (like cursor and iframe interaction).
    useEffect(() => {
        if (!isDragging) return;

        const previewIframe = document.querySelector('iframe[title="Component Preview"]') as HTMLIFrameElement | null;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        if (previewIframe) {
            previewIframe.style.pointerEvents = 'none';
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Cleanup function to run when isDragging becomes false or the component unmounts.
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (previewIframe) {
                previewIframe.style.pointerEvents = 'auto';
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Keyboard navigation for the divider.
    const handleDividerKeyDown = useCallback((e: React.KeyboardEvent) => {
        const step = e.shiftKey ? 10 : 1;
        let newPosition: number | null = null;

        // Use a functional update to get the latest state without adding it as a dependency.
        setDividerPosition(currentPosition => {
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
                return newPosition;
            }
            return currentPosition;
        });
    }, []);

    // Function for external updates (e.g., reset button).
    const setPosition = useCallback((newPosition: number) => {
        const clampedPosition = Math.max(PANEL_MIN_SIZE_PERCENT, Math.min(PANEL_MAX_SIZE_PERCENT, newPosition));
        setDividerPosition(clampedPosition);
    }, []);

    return {
        dividerPosition,
        setDividerPosition: setPosition, // Expose the external update function
        isDragging,
        handleMouseDown,
        handleDividerKeyDown,
    };
};