
export const RESET_ANIMATION_DURATION_MS = 300;
export const PROMPT_MAX_LENGTH = 4000;

// --- Resizable Panel Constants ---
export const PANEL_DEFAULT_SIZE_PERCENT = 50;
export const PANEL_MIN_SIZE_PERCENT = 25;
export const PANEL_MAX_SIZE_PERCENT = 75;

// --- Sandbox Path ---
export const SANDBOX_PATH = '/sandbox.html';

// Centralized for UI consistency.
export const TOOLTIP_CLASSES = "absolute bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100 transition-all pointer-events-none transform translate-y-0 group-hover:-translate-y-1 group-focus:-translate-y-1 duration-fast tooltip-with-arrow";

// Centralized for robust state persistence.
export const LOCAL_STORAGE_KEYS = {
    PROMPT: 'prompt',
    RESPONSE: 'response',
    THEME: 'theme',
    API_KEY: 'api-key',
    LINE_WRAP_ENABLED: 'line-wrap-enabled',
    CODE_FONT_SIZE: 'code-font-size',
    DIVIDER_POSITION: 'divider-position',
};