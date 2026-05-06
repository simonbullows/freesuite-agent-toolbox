# FreeSuite.AI — Agent Toolbox

> Native desktop tools for AI agents. Discover, invoke, and monitor system-level capabilities through an MCP-compatible tool registry.

**🌐 [freesuite.ai](https://freesuite.ai)**

---

## What Is This?

FreeSuite Agent Toolbox is a **Tauri 2 desktop application** that exposes native operating system capabilities as structured, discoverable tools that AI agents (like Hermes, Antigravity, or custom agents) can programmatically invoke.

Think of it as a **local MCP server with a dashboard** — agents can scan your hardware, execute shell commands, download files, and monitor processes, all through a typed API with full execution logging.

## Architecture

```
┌─────────────────────────────────────────┐
│              Agent Layer                │
│   (Hermes / Antigravity / External)     │
├─────────────────────────────────────────┤
│           MCP Tool Registry             │
│  ┌───────────┬──────────┬────────────┐  │
│  │  system.  │  file.   │   shell.   │  │
│  │   scan    │ download │  execute   │  │
│  └───────────┴──────────┴────────────┘  │
├─────────────────────────────────────────┤
│          Rust / Tauri Backend           │
│   sysinfo · reqwest · tokio · zip      │
├─────────────────────────────────────────┤
│         React Dashboard (UI)            │
│   Tool Registry · Activity · System    │
└─────────────────────────────────────────┘
```

## Built-in Tools

| Tool ID | Description | Category |
|---------|-------------|----------|
| `system.scan` | Scan CPU, GPU, RAM, disk, and OS info | system |
| `system.processes` | List running processes with CPU/memory usage | system |
| `file.download` | Download files from URLs with progress tracking | file |
| `shell.execute` | Execute shell commands and return stdout/stderr | system |

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

- **[FreeSuite](https://freesuite.xyz)** — Free & open-source creative suite (the Adobe alternative)
- **FreeSuite.AI** — This project. Agent-first native toolbox.

## License

MIT
