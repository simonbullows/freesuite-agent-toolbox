# FreeSuite.AI — Agent Toolbox

> An open-source app launcher where every tool is agent-drivable. Replace paid suites with free alternatives that AI agents can pilot autonomously.

**🌐 [freesuite.ai](https://freesuite.ai)**

---

## ⚡ The FreeSuite Product Split

FreeSuite is **two separate products** with two separate repos:

| Product | Domain | What It Does | Repo |
|---------|--------|-------------|------|
| **FreeSuite Creative** | [freesuite.xyz](https://freesuite.xyz) | Open-source creative suite (Adobe alternative) | [simonbullows/FREESUITE](https://github.com/simonbullows/FREESUITE) |
| **FreeSuite.AI Agent Toolbox** | [freesuite.ai](https://freesuite.ai) | Agent-drivable app launcher (this repo) | [simonbullows/freesuite-agent-toolbox](https://github.com/simonbullows/freesuite-agent-toolbox) |

**This repo** is the Agent Toolbox — a native desktop app that exposes 44+ tools across 10 categories to AI agents via typed APIs. Agents can invoke system commands, manage files, convert documents, generate images, manipulate video, and more — all through a structured, capability-aware interface.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│               Agent Orchestrator                    │
│           (Hermes Web UI / External)                │
├─────────────────────────────────────────────────────┤
│              MCP Tool Registry                      │
│   44 tools · 10 categories · typed I/O schemas      │
│  ┌─────────┬──────────┬──────────┬──────────────┐   │
│  │ system  │   file   │   web    │   obsidian   │   │
│  │  media  │  ai_gen  │    3d    │   office     │   │
│  │  email  │   pdf    │  design  │   project    │   │
│  └─────────┴──────────┴──────────┴──────────────┘   │
├─────────────────────────────────────────────────────┤
│       Rust / Tauri Backend (~1,500 lines)            │
│  sysinfo · reqwest · tokio · nvidia-smi · CLI        │
├─────────────────────────────────────────────────────┤
│         React Dashboard (Launcher UI)                │
│  Software Rack · Mode Selector · Mission Log         │
│  Autopilot 🤖  ·  Spectator 👀  ·  Copilot 🧑‍✈️       │
└─────────────────────────────────────────────────────┘
```

## Three Operating Modes

| Mode | Behaviour | Use Case |
|------|-----------|----------|
| **🤖 Autopilot** | Agent works autonomously. Dangerous actions still require approval. | Background work, batch tasks |
| **👀 Spectator** | Agent works autonomously while you watch live on the dashboard. | Monitoring, learning |
| **🧑‍✈️ Copilot** | Agent proposes each action, you approve/edit/skip. | Sensitive tasks, pair work |

## Software Integrations (44 tools)

| Replaces | FreeSuite Uses | Agent Interface | Status |
|----------|---------------|----------------|--------|
| Microsoft Office | **LibreOffice** | `soffice --headless` CLI | ✅ Implemented |
| Adobe Acrobat | **Stirling PDF** | REST API :8080 | 🔶 Partial |
| Gmail/Outlook | **IMAP/SMTP** | Protocol-level | 🔶 Schema |
| Adobe Premiere | **FFmpeg** | CLI | ✅ Implemented |
| Notion | **Obsidian** | Filesystem (markdown) | ✅ Implemented |
| Figma/Canva | **[Penpot](https://penpot.app)** | REST API | 📋 Planned |
| Salesforce | **Twenty CRM** | GraphQL + MCP | 📋 Planned |
| Jira/Asana | **Plane** | REST API | 📋 Planned |
| Adobe Photoshop | **ComfyUI** | HTTP + WebSocket | 🔶 Partial |
| Stock Music | **ACE-Step** | Python API | 📋 Planned |
| Maya/3DS Max | **Blender** | `--background --python` | 🔶 Schema |
| Unity | **Godot** | `--headless --script` | 🔶 Schema |

### ⚠️ Open Design — NOT in this repo

[Open Design](https://github.com/nexu-io/open-design) (30k+ ★) is a design skill pack that extends the **agent itself**, not a tool the Toolbox calls. It belongs in your agent orchestrator (Hermes), not in this launcher. See the [Hermes config docs] for how to add it to your agent roster.

## Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Framer Motion, Zustand
- **Backend:** Rust, Tauri 2, sysinfo, reqwest, tokio
- **Design:** Dark-first, glassmorphic agent control plane aesthetic

## Getting Started

```bash
# Clone
git clone https://github.com/simonbullows/freesuite-agent-toolbox.git
cd freesuite-agent-toolbox

# Install
npm install

# Development (requires Rust + MSVC Build Tools)
npm run tauri dev
```

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) + Cargo
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) (Windows)

## Related

- **[FreeSuite Creative](https://freesuite.xyz)** — Free & open-source creative suite (the Adobe alternative) · [repo](https://github.com/simonbullows/FREESUITE)
- **[Open Design](https://github.com/nexu-io/open-design)** — Design platform integrated into our stack
- **[Hermes Web UI](https://github.com/hermes-ai/hermes)** — Agent orchestrator

## License

MIT
