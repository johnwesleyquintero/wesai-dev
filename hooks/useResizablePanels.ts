import React, { useState, useCallback, useEffect } from 'react';
import usePersistentState from './usePersistentState';
import { PANEL_DEFAULT_SIZE_PERCENT, PANEL_MIN_SIZE_PERCENT, PANEL_MAX_SIZE_PERCENT } from '../constants';

export const useResizablePanels = (mainContainerRef: React.RefObject<HTMLDivElement>) => {
    const [dividerPosition, setDividerPosition] = usePersistentState('dividerPosition', PANEL_DEFAULT_SIZE_PERCENT);
    const [isDragging, setIsDragging] = useState(false);

    // Apply panel widths via CSS custom properties
    useEffect(() => {
        if (mainContainerRef.current) {
            // The divider is 1rem (16px) wide on desktop
            mainContainerRef.current.style.setProperty('--panel-one-width', `${dividerPosition}%`);
            mainContainerRef.current.style.setProperty('--panel-two-width', `calc(100% - ${dividerPosition}% - 1rem)`);
        }
    }, [dividerPosition, mainContainerRef]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && mainContainerRef.current) {
            const containerRect = mainContainerRef.current.getBoundingClientRect();
            const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Constrain panel sizes
            if (newPosition >= PANEL_MIN_SIZE_PERCENT && newPosition <= PANEL_MAX_SIZE_PERCENT) {
                setDividerPosition(newPosition);
            }
        }
    }, [isDragging, mainContainerRef, setDividerPosition]);

    const handleDividerKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setDividerPosition(prev => Math.max(PANEL_MIN_SIZE_PERCENT, prev - 1));
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setDividerPosition(prev => Math.min(PANEL_MAX_SIZE_PERCENT, prev + 1));
        } else if (e.key === 'Home') {
            e.preventDefault();
            setDividerPosition(PANEL_MIN_SIZE_PERCENT);
        } else if (e.key === 'End') {
            e.preventDefault();
            setDividerPosition(PANEL_MAX_SIZE_PERCENT);
        }
    }, [setDividerPosition]);

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

    return {
        dividerPosition,
        setDividerPosition,
        isDragging,
        handleMouseDown,
        handleDividerKeyDown
    };
};
