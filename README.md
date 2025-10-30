# WesAI.Dev

Create stunning apps & websites by chatting with AI.

WesAI.Dev is an AI-powered scratchpad for developers to quickly brainstorm, architect, and prototype ideas. It acts as a personal AI partner, leveraging the power of Google's Gemini model to turn natural language descriptions into functional web components.

## Key Features

- **Component Generation:** Describe a UI component in plain English, and WesAI.Dev will generate a self-contained React component for it.
- **Live Preview:** Instantly see a live, interactive preview of the generated component in a secure sandbox.
- **Code Access:** Easily view and copy the underlying React (.tsx) code for use in your own projects.
- **Bring Your Own Key:** Securely use your own Google Gemini API key, stored only in your browser's local storage.
- **Modern UI/UX:** A clean, developer-focused interface designed for productivity.

## How It Works

This application is powered by an AI agent that utilizes the [Google Gemini API](https://ai.google.dev/). It uses the `gemini-2.5-pro` model with a structured JSON output schema to ensure reliable and well-formed code generation. To use the app, you must provide your own Google Gemini API key, which is stored securely in your browser's local storage and is never sent to any server other than Google's.

The frontend is built with React and TypeScript, providing a robust and type-safe development experience.

## Getting Started

1.  **Set API Key:** Click the gear icon in the header to open the settings modal. Enter your Google Gemini API key. You can get a key for free from [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Describe a Component:**
    - In the "Input" text area, write a detailed description of the UI element you want to create.
    - **Example:** _"A responsive pricing card with three tiers: Basic, Pro, and Enterprise. Each card should show the plan name, price, a list of features, and a call-to-action button. The Pro plan should be highlighted."_
3.  **Generate:**
    - Press the "Generate with WesAI" button or use the keyboard shortcut `Cmd/Ctrl + Enter`.
4.  **Review:**
    - The output panel will show a live **Preview** of your component.
    - Click the **Code** tab to view and copy the generated React component (.tsx) code.

---

Built by WesAI for John Wesley Quintero.