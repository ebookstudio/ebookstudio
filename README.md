# ebookstudio

<div align="center">
  <img src="https://github.com/opendev-labs.png" width="120" height="120" style="border-radius: 50%" />
  <h3>The Neural Manuscript Engine</h3>
  <p><i>Where Thought Becomes Literature</i></p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-white.svg?style=flat-square)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/Frontend-React-white.svg?style=flat-square)](https://reactjs.org/)
  [![Gemini AI](https://img.shields.io/badge/AI-Gemini%201.5-white.svg?style=flat-square)](https://deepmind.google/technologies/gemini/)
</div>

---

## 💎 Overview

**ebookstudio** is a professional-grade SaaS platform designed for the modern author. Powered by the **Studio AI** neural engine, it transforms fragmented ideas into market-ready manuscripts. Whether you are an indie author or a sovereign publisher, ebookstudio provides the tools to write, design, and monetize your intellectual assets in a luxury digital environment.

## 🚀 Key Features

- **Neural Auto-Pilot**: High-fidelity manuscript synthesis using the Gemini 1.5 Pro architecture.
- **Morphic-Eye Interface**: A unique, responsive design system built for focus and creative immersion.
- **Multi-Modal Studio**: Supports text, voice-to-prose transcription, and AI-driven visual asset generation.
- **Sovereign Publishing**: One-click deployment to personalized creator sites.
- **Global Commerce**: Integrated checkout system with USD support and instant digital delivery.

## 🛠 Tech Stack

- **Core**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with a Custom Design System (Luxury/Obsidian aesthetic)
- **Intelligence**: Google Gemini 1.5 API (Pro & Flash)
- **Deployment**: Optimized for GitHub Pages & Vercel
- **State**: Custom AppContext for persistent user sessions

## ⚡ Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ebookstudio/ebookstudio.git
   cd ebookstudio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Launch Dev Environment:**
   ```bash
   npm run dev
   ```

## 📜 Repository Structure

- `/components`: Modular UI elements (Studio, Dashboard, Shared)
- `/pages`: High-level route views (Store, Pricing, Studio)
- `/services`: Core logic (AI integration, Mock persistence)
- `/contexts`: Global state management
- `/constants`: Design tokens and static configurations

---

## 🛡️ Identity & Ownership

**ebookstudio** is a sovereign project by **[opendev-labs](https://github.com/opendev-labs)**. 

If you are a developer or contributor, ensure your git identity is configured for proper attribution:
```bash
git config --local user.name "opendev-labs"
git config --local user.email "your-github-email@example.com"
```

---

<div align="center">
  <p>© 2026 opendev-labs. All rights reserved.</p>
</div>
