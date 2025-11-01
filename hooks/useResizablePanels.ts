
// FIX: Import React to make the React namespace available for types.
import React, { useState, useCallback, useEffect } from 'react';
import usePersistentState from './usePersistentState';
import { PANEL_DEFAULT_SIZE_PERCENT, PANEL_MIN_SIZE_PERCENT, PANEL_MAX_SIZE_PERCENT, LOCAL_STORAGE_KEYS } from '../constants';

export const useResizablePanels = (mainContainerRef: React.RefObject<HTMLDivElement>) => {
    const [dividerPosition, setDividerPosition] = usePersistentState<number>(LOCAL_STORAGE_KEYS.DIVIDER_POSITION, PANEL_DEFAULT_SIZE_PERCENT);
    const [isDragging, setIsDragging] = useState<boolean>(false);

    // Apply the width to the panel via CSS custom property.
    useEffect(() => {
        if (mainContainerRef.current) {
            // Ensure the position is within bounds on initial load from storage
            const clampedPosition = Math.max(PANEL_MIN_SIZE_PERCENT, Math.min(PANEL_MAX_SIZE_PERCENT, dividerPosition));
            mainContainerRef.current.style.setProperty('--panel-one-basis', `${clampedPosition}%`);
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
    }, [mainContainerRef, setDividerPosition]);

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
        
        // Fix: Use a functional update to prevent stale state issues.
        // This is crucial because dividerPosition is not in the dependency array.
        setDividerPosition(currentPosition => {
            let newPosition: number | null = null;
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
    }, [setDividerPosition]);

    // Function for external updates (e.g., reset button).
    const setPosition = useCallback((newPosition: number) => {
        const clampedPosition = Math.max(PANEL_MIN_SIZE_PERCENT, Math.min(PANEL_MAX_SIZE_PERCENT, newPosition));
        setDividerPosition(clampedPosition);
    }, [setDividerPosition]);

    return {
        dividerPosition,
        setDividerPosition: setPosition, // Expose the external update function
        isDragging,
        handleMouseDown,
        handleDividerKeyDown,
    };
};
