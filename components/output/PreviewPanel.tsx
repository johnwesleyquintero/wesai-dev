
import React, { useRef, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const PreviewPanel: React.FC<{ code: string; theme: Theme; }> = ({ code, theme }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isSandboxReady, setIsSandboxReady] = useState(false);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.source === iframeRef.current?.contentWindow && event.data.type === 'SANDBOX_READY') {
                setIsSandboxReady(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);
    
    // Decouple theme updates from code rendering to prevent unnecessary re-renders in the sandbox.
    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'RENDER_CODE',
                payload: { code }
            }, '*');
        }
    }, [code, isSandboxReady]);

    useEffect(() => {
        if (isSandboxReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SET_THEME',
                payload: { theme }
            }, '*');
        }
    }, [theme, isSandboxReady]);

    return (
        <iframe
            ref={iframeRef}
            src="/sandbox.html"
            title="Component Preview"
            className="w-full h-full border-0 bg-transparent"
            sandbox="allow-scripts"
        />
    );
};

export default PreviewPanel;
