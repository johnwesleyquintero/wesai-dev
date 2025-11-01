export const RESET_ANIMATION_DURATION_MS = 300;
export const PROMPT_MAX_LENGTH = 4000;

// --- Resizable Panel Constants ---
export const PANEL_DEFAULT_SIZE_PERCENT = 50;
export const PANEL_MIN_SIZE_PERCENT = 25;
export const PANEL_MAX_SIZE_PERCENT = 75;

// --- Sandbox Path ---
export const SANDBOX_PATH = '/sandbox.html';

// --- Model Configuration ---
export const GEMINI_MODEL = 'gemini-2.5-flash';

// --- UI Text & Data ---
export const LOADING_MESSAGES = [
    "Connecting to WesAI...",
    "Analyzing prompt...",
    "Architecting component...",
    "Polishing the pixels..."
];

export interface ProTipPart {
  type: 'text' | 'kbd';
  content: string;
}

export interface ProTipData {
  parts: ProTipPart[];
}

export const PRO_TIPS: ProTipData[] = [
  { parts: [{type: 'text', content: 'Press '}, {type: 'kbd', content: 'Cmd'}, {type: 'text', content: ' + '}, {type: 'kbd', content: 'Enter'}, {type: 'text', content: ' to generate.'}] },
  { parts: [{type: 'text', content: 'Be specific for better results. Try describing colors, layout, and state.'}] },
  { parts: [{type: 'text', content: "Need icons? Ask for 'inline SVGs' in your prompt for best results."}] },
  { parts: [{type: 'text', content: "WesAI is great for brainstorming variations. Try asking for 'another version'."}] },
  { parts: [{type: 'text', content: "Describe animations like 'a button that pulses on hover' for interactive results."}] },
];


// --- UI Component Styles ---
export const TOOLTIP_CLASSES = "absolute bottom-full mb-2 whitespace-nowrap rounded-md bg-slate-800 dark:bg-slate-900 px-2 py-1 text-xs font-semibold text-white opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 group-focus:opacity-100 group-focus:scale-100 transition-all pointer-events-none transform translate-y-0 group-hover:-translate-y-1 group-focus:-translate-y-1 duration-fast tooltip-with-arrow";

// Centralized button variants for reuse.
export const BUTTON_VARIANTS = {
  default: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:opacity-90 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/40 animate-gradient focus-visible:ring-indigo-500",
  destructive: "bg-red-600 hover:bg-red-700 text-white font-bold transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/40 focus-visible:ring-red-500"
};

// Centralized for robust state persistence.
export const LOCAL_STORAGE_KEYS = {
    PROMPT: 'prompt',
    RESPONSE: 'response',
    THEME: 'theme',
    SETTINGS: 'settings', // Consolidated settings key
    DIVIDER_POSITION: 'divider-position',
};
