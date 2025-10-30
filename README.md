# WesAI.Dev

Create stunning apps & websites by chatting with AI.

WesAI.Dev is an AI-powered scratchpad for developers to quickly brainstorm, architect, and prototype ideas. It acts as a personal AI partner, leveraging the power of Google's Gemini model to turn natural language descriptions into functional web components.

## Key Features

- **Component Generation:** Describe a UI component in plain English, and WesAI.Dev will generate the HTML, CSS, and JavaScript for it.
- **Live Preview:** Instantly see a live, interactive preview of the generated component.
- **Code Access:** Easily view and copy the underlying code for use in your own projects.
- **Zero-Config Setup:** The API key is managed securely, so you can start prototyping immediately.
- **Modern UI/UX:** A clean, developer-focused interface designed for productivity.

## How It Works

This application is powered by an AI agent that utilizes the [Google Gemini API](https://ai.google.dev/). It uses the `gemini-2.5-pro` model with a structured JSON output schema to ensure reliable and well-formed code generation. The API key is managed securely as an environment variable, providing a seamless zero-configuration user experience.

The frontend is built with React and TypeScript, providing a robust and type-safe development experience.

## Getting Started

1.  **Open the App:** Navigate to the application URL.
2.  **Describe a Component:**
    - In the "Describe a Component" text area, write a detailed description of the UI element you want to create.
    - **Example:** _"A responsive pricing card with three tiers: Basic, Pro, and Enterprise. Each card should show the plan name, price, a list of features, and a call-to-action button. The Pro plan should be highlighted."_
3.  **Generate:**
    - Press the "Generate with WesAI" button or use the keyboard shortcut `Cmd/Ctrl + Enter`.
4.  **Review:**
    - The output panel will show a live **Preview** of your component.
    - Click the **Code** tab to view and copy the generated HTML, CSS, and JavaScript.

---

Built by WesAI for John Wesley Quintero.