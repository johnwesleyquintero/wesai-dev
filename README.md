# WesAI.Dev

Your AI-Powered Dev Scratchpad & Brainstorming Partner.

WesAI.Dev is an AI-powered scratchpad for developers to quickly brainstorm, architect, and prototype ideas. It acts as a personal AI partner, leveraging the power of Google's Gemini model to turn natural language descriptions into functional web components.

## Key Features

- **Component Generation:** Describe a UI component in plain English, and WesAI.Dev will generate the HTML, CSS, and JavaScript for it.
- **Live Preview:** Instantly see a live, interactive preview of the generated component.
- **Code Access:** Easily view and copy the underlying code for use in your own projects.
- **Secure API Key Storage:** Configure your own Gemini API key, which is stored securely in your browser's local storage and never sent to any server.
- **Modern UI/UX:** A clean, developer-focused interface designed for productivity.

## How It Works

This application utilizes the [Google Gemini API](https://ai.google.dev/) to understand your prompts and generate code. Specifically, it uses the `gemini-2.5-pro` model with a structured JSON output schema to ensure reliable and well-formed code generation.

The frontend is built with React and TypeScript, providing a robust and type-safe development experience.

## Getting Started

1.  **Open the App:** Navigate to the application URL.
2.  **Set Your API Key:**
    - Click the **settings icon** (⚙️) in the top-right corner.
    - Paste your [Google Gemini API key](https://makersuite.google.com/app/apikey). You can generate one from Google AI Studio.
    - Click "Save and Close". Your key is now saved locally.
3.  **Describe a Component:**
    - In the "Describe a Component" text area, write a detailed description of the UI element you want to create.
    - **Example:** _"A responsive pricing card with three tiers: Basic, Pro, and Enterprise. Each card should show the plan name, price, a list of features, and a call-to-action button. The Pro plan should be highlighted."_
4.  **Generate:**
    - Press the "Generate with WesAI" button or use the keyboard shortcut `Cmd/Ctrl + Enter`.
5.  **Review:**
    - The output panel will show a live **Preview** of your component.
    - Click the **Code** tab to view and copy the generated HTML, CSS, and JavaScript.

---

Built by WesAI for John Wesley Quintero.
