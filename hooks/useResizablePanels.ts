

import React, { useState, useCallback, useEffect } from 'react';
import usePersistentState from './usePersistentState';
import { PANEL_DEFAULT_SIZE_PERCENT, PANEL_MIN_SIZE_PERCENT, PANEL_MAX_SIZE_PERCENT, LOCAL_STORAGE_KEYS } from '../constants';

export const useResizablePanels = (mainContainerRef: React.RefObject<HTMLDivElement>) => {
    // Manages the value in localStorage
    const [persistedDividerPosition, setPersistedDividerPosition] = usePersistentState(LOCAL_STORAGE_KEYS.DIVIDER_POSITION, PANEL_DEFAULT_SIZE_PERCENT);
    // Manages the live value during drag for smooth UI updates
    const [liveDividerPosition, setLiveDividerPosition] = useState(persistedDividerPosition);
    
    const [isDragging, setIsDragging] = useState(false);

    // Apply panel widths via CSS custom properties using the live position
    useEffect(() => {
        if (mainContainerRef.current) {
            mainContainerRef.current.style.setProperty('--panel-one-width', `${liveDividerPosition}%`);
            mainContainerRef.current.style.setProperty('--panel-two-width', `calc(100% - ${liveDividerPosition}% - 1rem)`);
        }
    }, [liveDividerPosition, mainContainerRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        // On drag end, persist the final live position.
        if (isDragging) {
          setPersistedDividerPosition(liveDividerPosition);
        }
    }, [isDragging, liveDividerPosition, setPersistedDividerPosition]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && mainContainerRef.current) {
            const containerRect = mainContainerRef.current.getBoundingClientRect();
            const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Constrain panel sizes
            if (newPosition >= PANEL_MIN_SIZE_PERCENT && newPosition <= PANEL_MAX_SIZE_PERCENT) {
                setLiveDividerPosition(newPosition);
            }
        }
    }, [isDragging, mainContainerRef]);

    const handleDividerKeyDown = useCallback((e: React.KeyboardEvent) => {
        let newPosition: number | null = null;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            newPosition = Math.max(PANEL_MIN_SIZE_PERCENT, liveDividerPosition - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            newPosition = Math.min(PANEL_MAX_SIZE_PERCENT, liveDividerPosition + 1);
        } else if (e.key === 'Home') {
            e.preventDefault();
            newPosition = PANEL_MIN_SIZE_PERCENT;
        } else if (e.key === 'End') {
            e.preventDefault();
            newPosition = PANEL_MAX_SIZE_PERCENT;
        }
        
        if (newPosition !== null) {
            // Update both live and persisted state for discrete changes
            setLiveDividerPosition(newPosition);
            setPersistedDividerPosition(newPosition);
        }
    }, [liveDividerPosition, setPersistedDividerPosition]);

    useEffect(() => {
        const previewIframe = document.querySelector('iframe[title="Component Preview"]') as HTMLIFrameElement | null;

        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            if (previewIframe) {
                previewIframe.style.pointerEvents = 'none';
            }
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            if (previewIframe) {
                previewIframe.style.pointerEvents = 'auto';
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // This function is for external updates, like the reset button.
    const setDividerPosition = useCallback((newPosition: number) => {
        setLiveDividerPosition(newPosition);
        setPersistedDividerPosition(newPosition);
    }, [setPersistedDividerPosition]);

    return {
        dividerPosition: liveDividerPosition, // The component should always render based on the live position
        setDividerPosition, // Expose the function to set both states
        isDragging,
        handleMouseDown,
        handleDividerKeyDown
    };
};