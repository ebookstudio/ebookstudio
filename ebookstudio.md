# ebookstudio

## The Professional AI Publishing Platform

Welcome to **ebookstudio**, the definitive platform for creating, refining, and selling digital literature. Powered by the proprietary **Studio AI** neural engine, this software bridges the gap between human creativity and machine intelligence.

---

## 🚀 Quick Start (Linux/Unix)

### Step 1: Installation
Run the installer script to set up the environment and dependencies.

```bash
chmod +x install-ebook-engine.sh
./install-ebook-engine.sh
```

### Step 2: Launch Studio
Start the development server with hot-reloading enabled.

```bash
chmod +x run-ebook-engine.sh
./run-ebook-engine.sh --dev
```

---

## 🏗 Architecture & Core Systems

**ebookstudio** is architected as a high-performance, serverless Single Page Application (SPA).

*   **Frontend**: React 18 + Vite (TypeScript)
*   **Neural Engine**: Studio AI (powered by Google Gemini 2.5 Flash)
*   **Styling**: Tailwind CSS with custom `obsidian` easing
*   **State Management**: React Context + LocalStorage Persistence

### The Studio AI Engine
The heart of **ebookstudio** is **Studio AI**, an advanced AI agent designed for narrative consistency.
*   **Context Awareness**: Remembers previous chapters and character arcs.
*   **Visual Synthesis**: Generates cover art and inline illustrations via Gemini 2.5 Image.
*   **Spectral Analysis**: Analyzes PDF manuscripts for genre, tone, and pacing.

---

## 🌐 Deployment (GitHub Pages)

To host your own instance of **ebookstudio**:

1.  **Build**: `npm run build`
2.  **Deploy**: Push the `dist` folder to your `gh-pages` branch.
3.  **Access**: Visit `https://your-username.github.io/ebookstudio/`

---

## 🎨 Professional Suite

*   **Studio Editor**: A distraction-free markdown environment with slash commands (`/img`, `/h1`).
*   **Marketplace**: A fully functional digital store for selling your creations.
*   **Writer Dashboard**: Real-time analytics, revenue tracking, and audience insights.

---

**© OpenDev Labs.** *Where Thought Becomes Literature.*