import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { useToolboxStore, type AgentMode, type ToolCapability } from '../stores/toolboxStore';
import {
  FileText, FileStack, Image, Film, StickyNote, Box, Users, Mail, LayoutGrid, Music,
  Cpu, HardDrive, Activity, CheckCircle2, XCircle, Clock, Bot, Eye, UserCog,
  AlertTriangle, Download, Play, ArrowRight, X, ExternalLink, Terminal, Copy,
  MoreHorizontal, ArrowUpRight,
} from 'lucide-react';
import heroBanner from '../assets/images/hero_banner.png';

/* ── Install info type ── */
interface AppInstallInfo {
  app_id: string; name: string; installed: boolean; version: string | null;
  description: string; install_url: string; install_command: string | null;
}

/* ── Install Modal ── */
function InstallModal({ info, onClose }: { info: AppInstallInfo; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copyCmd = () => {
    if (info.install_command) { navigator.clipboard.writeText(info.install_command); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md mx-4 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{info.name}</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"><X size={20} className="text-zinc-500" /></button>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{info.description}</p>
        {info.installed && info.version && (
          <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="text-sm text-green-400 font-medium">Installed</span>
            <span className="text-xs text-zinc-500 font-mono ml-auto">{info.version}</span>
          </div>
        )}
        {info.install_command && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 font-medium flex items-center gap-2"><Terminal size={12} /> Quick Install</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2.5 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-400 font-mono truncate">{info.install_command}</code>
              <button onClick={copyCmd} className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                {copied ? <span className="text-xs text-green-400 font-bold">Copied!</span> : <Copy size={14} className="text-zinc-400" />}
              </button>
            </div>
          </div>
        )}
        {info.install_url && (
          <a href={info.install_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-colors">
            <ExternalLink size={14} /> Download Page
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── App tile data ── */
interface AppTile { id: string; name: string; icon: React.ElementType; category: string; software: string; capabilityKey?: string; color: string; }
const APP_TILES: AppTile[] = [
  { id: 'docs',    name: 'Documents', icon: FileText,  category: 'office',    software: 'LibreOffice',     capabilityKey: 'LibreOffice',      color: 'text-blue-400' },
  { id: 'pdf',     name: 'PDF Tools', icon: FileStack, category: 'pdf',       software: 'Stirling PDF',    capabilityKey: 'Stirling PDF',     color: 'text-red-400' },
  { id: 'image',   name: 'Image Gen', icon: Image,     category: 'ai_gen',    software: 'ComfyUI',         capabilityKey: 'ComfyUI (SD 1.5)', color: 'text-purple-400' },
  { id: 'video',   name: 'Video',     icon: Film,      category: 'media',     software: 'FFmpeg',          capabilityKey: 'FFmpeg',           color: 'text-amber-400' },
  { id: 'notes',   name: 'Notes',     icon: StickyNote, category: 'knowledge', software: 'Obsidian',       capabilityKey: 'Obsidian',         color: 'text-violet-400' },
  { id: '3d',      name: '3D Engine', icon: Box,       category: '3d',        software: 'Blender',         capabilityKey: 'Blender',          color: 'text-orange-400' },
  { id: 'crm',     name: 'CRM',       icon: Users,     category: 'crm',       software: 'Twenty',          color: 'text-cyan-400' },
  { id: 'email',   name: 'Email',     icon: Mail,      category: 'email',     software: 'IMAP / SMTP',     color: 'text-emerald-400' },
  { id: 'project', name: 'Projects',  icon: LayoutGrid, category: 'project',  software: 'Plane',           color: 'text-indigo-400' },
  { id: 'music',   name: 'Music Gen', icon: Music,     category: 'music',     software: 'ACE-Step',        capabilityKey: 'ACE-Step (base)',  color: 'text-pink-400' },
];

/* ── Status logic ── */
function getStatus(tile: AppTile, caps: ToolCapability[]): { installed: boolean; label: string; } {
  const cap = caps.find(c => c.tool === tile.capabilityKey);
  if (!cap) {
    if (['crm', 'email', 'project'].includes(tile.category)) return { installed: false, label: 'Configure' };
    return { installed: false, label: 'Not installed' };
  }
  if (cap.installed && (cap.status === 'local' || cap.status === 'cpu_only')) return { installed: true, label: 'Ready' };
  if (cap.installed && cap.status === 'tight') return { installed: true, label: 'Tight VRAM' };
  if (!cap.installed) return { installed: false, label: 'Not installed' };
  return { installed: false, label: 'Stopped' };
}

/* ── Mode selector ── */
function ModeSelector({ mode, setMode }: { mode: AgentMode; setMode: (m: AgentMode) => void }) {
  const modes: { key: AgentMode; icon: React.ElementType; label: string }[] = [
    { key: 'autopilot', icon: Bot, label: 'Auto' },
    { key: 'spectator', icon: Eye, label: 'Watch' },
    { key: 'copilot', icon: UserCog, label: 'Copilot' },
  ];
  return (
    <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
      {modes.map(({ key, icon: Icon, label }) => (
        <button key={key} onClick={() => setMode(key)}
          className={`relative flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-colors ${
            mode === key ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
          }`}>
          <Icon size={13} />{label}
        </button>
      ))}
    </div>
  );
}

/* ── Dashboard ── */
export function Dashboard() {
  const { tools, fetchTools, systemScan, scanSystem, scanningSystem, executions, fetchExecutions, capabilities, checkCapabilities, agentMode, setAgentMode } = useToolboxStore();
  const [installInfo, setInstallInfo] = useState<AppInstallInfo | null>(null);
  const [launchMsg, setLaunchMsg] = useState<string | null>(null);

  useEffect(() => { fetchTools(); scanSystem(); fetchExecutions(); checkCapabilities(); }, []);

  const handleTileClick = async (tile: AppTile) => {
    const status = getStatus(tile, capabilities);
    if (status.installed) {
      try {
        const result = await invoke<{ success: boolean; message: string }>('launch_app', { appId: tile.id });
        setLaunchMsg(result.message); setTimeout(() => setLaunchMsg(null), 2500);
      } catch (e) { setLaunchMsg(`Error: ${e}`); setTimeout(() => setLaunchMsg(null), 3000); }
    } else {
      try { const info = await invoke<AppInstallInfo>('get_install_info', { appId: tile.id }); setInstallInfo(info); }
      catch (e) { console.error(e); }
    }
  };

  const readyCount = capabilities.filter(c => c.installed || c.status === 'cpu_only').length;
  const gpuVram = capabilities.length > 0 ? capabilities[0].your_vram_mb : 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 pb-12">
        <div className="max-w-6xl mx-auto space-y-10">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-zinc-950 border border-zinc-900 overflow-hidden relative group"
          >
            <div className="flex flex-col md:flex-row h-[280px]">
              <div className="flex-1 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-black/80 z-10" />
                <div className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700 ease-out" style={{ backgroundImage: `url(${heroBanner})` }} />
              </div>
              <div className="flex-1 p-10 flex flex-col justify-center bg-zinc-900/30 backdrop-blur-sm border-l border-white/5">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 w-max mb-4">
                  <span className="text-xs font-medium text-zinc-300">Agent Control Plane</span>
                </div>
                <h1 className="text-4xl font-bold mb-3 tracking-tight leading-tight">
                  Your AI<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Toolbox</span>
                </h1>
                <p className="text-zinc-400 leading-relaxed mb-6 max-w-md text-sm">
                  {systemScan
                    ? `${systemScan.hostname} · ${gpuVram > 0 ? `${(gpuVram / 1024).toFixed(0)}GB VRAM` : 'CPU Mode'} · ${tools.length} tools`
                    : 'Launch, monitor, and manage your agent stack from a single pane.'}
                </p>
                <ModeSelector mode={agentMode} setMode={setAgentMode} />
              </div>
            </div>
          </motion.div>

          {/* Installed Apps Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Software Rack</h2>
              <span className="text-zinc-500 text-sm flex items-center gap-1">
                {readyCount}/{APP_TILES.length} ready <ArrowRight size={14} />
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {APP_TILES.map((tile, index) => {
                const status = getStatus(tile, capabilities);
                return (
                  <motion.div
                    key={tile.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -4 }}
                    onClick={() => handleTileClick(tile)}
                    className={`group p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                      status.installed
                        ? 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                        : 'bg-zinc-900/20 border-zinc-800/50 hover:bg-zinc-900/60 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800 border border-zinc-700 shadow-lg">
                        <tile.icon size={20} className={tile.color} />
                      </div>
                      <button className="text-zinc-600 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <h3 className="font-bold leading-tight group-hover:text-blue-400 transition-colors">{tile.name}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5 font-medium">{tile.software}</p>
                    <div className="mt-3">
                      {status.installed ? (
                        <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] text-emerald-300 font-medium">
                          {status.label}
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-2.5 py-0.5 text-[10px] text-zinc-500 font-medium">
                          {status.label}
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Tools Ready', value: readyCount, color: 'from-blue-500 to-cyan-500' },
              { label: 'Executions', value: executions.length, color: 'from-purple-500 to-pink-500' },
              { label: 'CPU Cores', value: systemScan?.cpu_cores ?? '—', color: 'from-orange-500 to-red-500' },
              { label: 'Memory', value: systemScan ? `${systemScan.used_memory_gb.toFixed(0)}G` : '—', color: 'from-emerald-500 to-teal-500' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"
              >
                <p className="text-zinc-500 text-sm mb-2">{stat.label}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                  {stat.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Mission Log */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Mission Log</h2>
              {agentMode === 'autopilot' && (
                <span className="flex items-center gap-2 text-xs text-green-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> AUTONOMOUS
                </span>
              )}
            </div>
            {executions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
                <Bot size={32} className="text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">No missions yet</p>
                <p className="text-sm text-zinc-600 mt-1">
                  {agentMode === 'autopilot' && 'Actions will log here automatically'}
                  {agentMode === 'spectator' && 'Watch agent actions stream in real-time'}
                  {agentMode === 'copilot' && 'Proposals will appear here for your approval'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {executions.slice().reverse().map((exec, i) => {
                  const time = exec.completed_at || exec.started_at;
                  const timeStr = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const icons: Record<string, React.ReactNode> = {
                    completed: <CheckCircle2 size={16} className="text-green-400" />,
                    failed: <XCircle size={16} className="text-red-400" />,
                    running: <Activity size={16} className="text-amber-400 animate-spin" />,
                    queued: <Clock size={16} className="text-zinc-500" />,
                    pending_approval: <AlertTriangle size={16} className="text-amber-400" />,
                  };
                  return (
                    <motion.div
                      key={exec.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    >
                      {icons[exec.status] || icons.queued}
                      <span className="flex-1 text-sm text-zinc-300 truncate font-mono">{exec.tool_id}</span>
                      {exec.duration_ms && <span className="text-xs text-zinc-600 font-mono">{exec.duration_ms}ms</span>}
                      <span className="text-xs text-zinc-600">{timeStr}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Launch toast */}
      <AnimatePresence>
        {launchMsg && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl flex items-center gap-3">
            <ArrowUpRight size={16} className="text-green-400" />
            <span className="text-sm text-zinc-300">{launchMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{installInfo && <InstallModal info={installInfo} onClose={() => setInstallInfo(null)} />}</AnimatePresence>
    </div>
  );
}
