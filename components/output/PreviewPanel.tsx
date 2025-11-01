
import React, { useRef, useState, useEffect } from 'react';
import { SANDBOX_PATH } from '../../constants';

type Theme = 'light' | 'dark';

interface PreviewPanelProps {
    code: string;
    theme: Theme;
    onError: (message: string) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, theme, onError }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isSandboxReady, setIsSandboxReady] = useState(false);

    // Consolidated message handler for all sandbox communication
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Security: Only accept messages from our own iframe's content window
            if (event.source !== iframeRef.current?.contentWindow) {
                return;
            }

            const { type, payload } = event.data;
            
            if (type === 'SANDBOX_READY') {
                setIsSandboxReady(true);
            } else if (type === 'RENDER_ERROR' && payload?.message) {
                onError(payload.message);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [onError]);
    
    // Decouple theme updates from code rendering to prevent unnecessary re-renders in the sandbox.
    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'RENDER_CODE',
                payload: { code }
            }, window.location.origin);
        }
    }, [code, isSandboxReady]);

    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SET_THEME',
                payload: { theme }
            }, window.location.origin);
        }
    }, [theme, isSandboxReady]);

    return (
        <iframe
            ref={iframeRef}
            src={SANDBOX_PATH}
            title="Component Preview"
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts"
        />
    );
};

export default PreviewPanel;