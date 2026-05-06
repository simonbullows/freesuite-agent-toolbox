import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { invoke } from '@tauri-apps/api/core';
import { useToolboxStore, type AgentMode, type ToolCapability } from '../stores/toolboxStore';
import {
  FileText, FileStack, Image, Film, StickyNote, Box, Users, Mail, LayoutGrid, Music,
  Cpu, HardDrive, Activity, CheckCircle2, XCircle, Clock, Bot, Eye, UserCog,
  AlertTriangle, Download, Play, Zap, ArrowUpRight, X, ExternalLink, Terminal, Copy,
} from 'lucide-react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-elevated rounded-2xl p-6 w-[440px] max-w-[90vw] space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-white">{info.name}</h3>
          <button onClick={onClose} className="text-white/20 hover:text-white/50 transition-colors"><X size={16} /></button>
        </div>
        <p className="text-[12px] text-white/35 leading-relaxed">{info.description}</p>
        {info.installed && info.version && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-success-500/8 border border-success-500/12">
            <div className="w-2 h-2 rounded-full bg-success-400" />
            <span className="text-[11px] text-success-400 font-semibold">Installed</span>
            <span className="text-[10px] text-white/20 font-mono ml-auto">{info.version}</span>
          </div>
        )}
        {info.install_command && (
          <div className="space-y-2">
            <span className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold flex items-center gap-1.5"><Terminal size={9} /> Quick Install</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-300/50 border border-white/[0.04] text-[11px] text-white/50 font-mono truncate">{info.install_command}</code>
              <button onClick={copyCmd} className="px-3 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all">
                {copied ? <span className="text-[9px] text-success-400 font-bold">Copied!</span> : <Copy size={13} className="text-white/25" />}
              </button>
            </div>
          </div>
        )}
        {info.install_url && (
          <a href={info.install_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent-500/10 border border-accent-500/12 hover:bg-accent-500/18 transition-all">
            <ExternalLink size={12} className="text-accent-400" />
            <span className="text-[11px] text-accent-400 font-semibold">Download Page</span>
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── App tile data ── */
interface AppTile { id: string; name: string; icon: React.ElementType; category: string; software: string; capabilityKey?: string; gradient: string; iconColor: string; }
const APP_TILES: AppTile[] = [
  { id: 'docs',    name: 'Documents', icon: FileText,  category: 'office',    software: 'LibreOffice',     capabilityKey: 'LibreOffice',      gradient: 'from-blue-500/10 to-blue-600/3',     iconColor: 'text-blue-400' },
  { id: 'pdf',     name: 'PDF Tools', icon: FileStack, category: 'pdf',       software: 'Stirling PDF',    capabilityKey: 'Stirling PDF',     gradient: 'from-red-500/10 to-red-600/3',       iconColor: 'text-red-400' },
  { id: 'image',   name: 'Image Gen', icon: Image,     category: 'ai_gen',    software: 'ComfyUI',         capabilityKey: 'ComfyUI (SD 1.5)', gradient: 'from-purple-500/10 to-purple-600/3', iconColor: 'text-purple-400' },
  { id: 'video',   name: 'Video',     icon: Film,      category: 'media',     software: 'FFmpeg',          capabilityKey: 'FFmpeg',           gradient: 'from-amber-500/10 to-amber-600/3',   iconColor: 'text-amber-400' },
  { id: 'notes',   name: 'Notes',     icon: StickyNote,category: 'knowledge', software: 'Obsidian',        capabilityKey: 'Obsidian',         gradient: 'from-violet-500/10 to-violet-600/3', iconColor: 'text-violet-400' },
  { id: '3d',      name: '3D Engine', icon: Box,       category: '3d',        software: 'Blender',         capabilityKey: 'Blender',          gradient: 'from-orange-500/10 to-orange-600/3', iconColor: 'text-orange-400' },
  { id: 'crm',     name: 'CRM',       icon: Users,     category: 'crm',       software: 'Twenty',          gradient: 'from-cyan-500/10 to-cyan-600/3',     iconColor: 'text-cyan-400' },
  { id: 'email',   name: 'Email',     icon: Mail,      category: 'email',     software: 'IMAP / SMTP',     gradient: 'from-emerald-500/10 to-emerald-600/3', iconColor: 'text-emerald-400' },
  { id: 'project', name: 'Projects',  icon: LayoutGrid,category: 'project',   software: 'Plane',           gradient: 'from-indigo-500/10 to-indigo-600/3', iconColor: 'text-indigo-400' },
  { id: 'music',   name: 'Music Gen', icon: Music,     category: 'music',     software: 'ACE-Step',        capabilityKey: 'ACE-Step (base)',  gradient: 'from-pink-500/10 to-pink-600/3',     iconColor: 'text-pink-400' },
];

/* ── Status logic ── */
function getStatus(tile: AppTile, caps: ToolCapability[]): { badge: string; label: string; color: string } {
  const cap = caps.find(c => c.tool === tile.capabilityKey);
  if (!cap) {
    if (['crm', 'email', 'project'].includes(tile.category)) return { badge: '🔶', label: 'Configure', color: 'text-warning-400' };
    return { badge: '❌', label: 'Not installed', color: 'text-white/20' };
  }
  if (cap.installed && (cap.status === 'local' || cap.status === 'cpu_only')) return { badge: '✅', label: 'Ready', color: 'text-success-400' };
  if (cap.installed && cap.status === 'tight') return { badge: '⚠️', label: 'Tight VRAM', color: 'text-warning-400' };
  if (cap.status === 'cloud_recommended') return { badge: '☁️', label: 'Cloud only', color: 'text-white/20' };
  if (!cap.installed) return { badge: '❌', label: 'Not installed', color: 'text-white/20' };
  return { badge: '🔶', label: 'Stopped', color: 'text-warning-400' };
}

/* ── Mode selector ── */
function ModeSelector({ mode, setMode }: { mode: AgentMode; setMode: (m: AgentMode) => void }) {
  const modes: { key: AgentMode; icon: React.ElementType; label: string }[] = [
    { key: 'autopilot', icon: Bot, label: 'Auto' },
    { key: 'spectator', icon: Eye, label: 'Watch' },
    { key: 'copilot', icon: UserCog, label: 'Copilot' },
  ];
  return (
    <div className="flex items-center gap-0.5 p-1 rounded-xl glass-card">
      {modes.map(({ key, icon: Icon, label }) => (
        <button key={key} onClick={() => setMode(key)}
          className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[11px] font-semibold transition-all ${
            mode === key ? 'text-white' : 'text-white/20 hover:text-white/40 hover:bg-white/[0.02]'
          }`}>
          {mode === key && (
            <motion.div layoutId="mode-bg" className="absolute inset-0 bg-white/[0.08] rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
          )}
          <span className="relative z-10 flex items-center gap-1.5"><Icon size={12} />{label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── Stat card ── */
function StatCard({ icon: Icon, label, value, sub, color = 'accent', delay = 0 }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
  color?: 'accent' | 'success' | 'warning' | 'error'; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-card gradient-border rounded-2xl p-5 stat-glow-${color}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.15em]">{label}</span>
        <div className={`w-7 h-7 rounded-lg bg-${color}-500/8 flex items-center justify-center`}>
          <Icon size={13} className={`text-${color}-400`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white tracking-tight leading-none">{value}</p>
      {sub && <p className="text-[10px] text-white/15 mt-1.5 font-medium">{sub}</p>}
    </motion.div>
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
    if (status.badge === '✅') {
      try {
        const result = await invoke<{ success: boolean; message: string }>('launch_app', { appId: tile.id });
        setLaunchMsg(result.message); setTimeout(() => setLaunchMsg(null), 2500);
      } catch (e) { setLaunchMsg(`Error: ${e}`); setTimeout(() => setLaunchMsg(null), 3000); }
    } else {
      try { const info = await invoke<AppInstallInfo>('get_install_info', { appId: tile.id }); setInstallInfo(info); }
      catch (e) { console.error(e); }
    }
  };

  const readyTools = capabilities.filter(c => c.installed || c.status === 'cpu_only').length;
  const gpuVram = capabilities.length > 0 ? capabilities[0].your_vram_mb : 0;

  return (
    <div className="p-6 max-w-[1100px] mx-auto space-y-5 relative">
      {/* Ambient orbs */}
      <div className="ambient-orb w-[400px] h-[400px] bg-accent-500 -top-48 -right-32 animate-breathe" />
      <div className="ambient-orb w-[300px] h-[300px] bg-purple-600 -bottom-32 -left-24 animate-breathe" style={{ animationDelay: '2s' }} />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">
            Agent Control <span className="text-gradient">Plane</span>
          </h1>
          <p className="text-white/18 text-[12px] mt-1 font-medium">
            {systemScan
              ? `${systemScan.hostname} · ${gpuVram > 0 ? `${(gpuVram / 1024).toFixed(0)}GB VRAM` : 'CPU Mode'}`
              : scanningSystem ? 'Scanning hardware...' : 'FreeSuite.AI'}
          </p>
        </div>
        <ModeSelector mode={agentMode} setMode={setAgentMode} />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 relative z-10">
        <StatCard icon={Zap}          label="Tools"   value={tools.length} sub={`${readyTools} ready locally`} color="accent"  delay={0.06} />
        <StatCard icon={CheckCircle2} label="Done"    value={executions.filter(e => e.status === 'completed').length} sub={executions.filter(e => e.status === 'failed').length > 0 ? `${executions.filter(e => e.status === 'failed').length} failed` : 'all healthy'} color="success" delay={0.1} />
        <StatCard icon={Cpu}          label="CPU"     value={systemScan ? `${systemScan.cpu_cores} cores` : '—'} sub={systemScan?.cpu_brand?.split(' ').slice(0, 3).join(' ')} color="warning" delay={0.14} />
        <StatCard icon={HardDrive}    label="RAM"     value={systemScan ? `${systemScan.used_memory_gb.toFixed(1)}G` : '—'} sub={systemScan ? `of ${systemScan.total_memory_gb.toFixed(0)}GB` : undefined} color="accent" delay={0.18} />
      </div>

      {/* Software Rack */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.5 }}
        className="glass-elevated gradient-border rounded-2xl p-6 relative z-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-bold text-white flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-accent-500/10 flex items-center justify-center">
              <LayoutGrid size={12} className="text-accent-400" />
            </div>
            Software Rack
          </h2>
          <span className="text-[10px] text-white/12 font-mono">{readyTools}/{APP_TILES.length} available</span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {APP_TILES.map((tile, i) => {
            const status = getStatus(tile, capabilities);
            return (
              <motion.button key={tile.id} onClick={() => handleTileClick(tile)}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.28 + i * 0.04, type: 'spring', stiffness: 280, damping: 22 }}
                className={`group relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl bg-gradient-to-br ${tile.gradient} border border-white/[0.03] hover:border-white/[0.08] transition-all tile-lift cursor-pointer`}>
                <span className="absolute top-2.5 right-2.5 text-[10px] leading-none">{status.badge}</span>
                <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center group-hover:bg-white/[0.08] transition-all shadow-inner shadow-black/10">
                  <tile.icon size={20} className={tile.iconColor} />
                </div>
                <div className="text-center">
                  <p className="text-[12px] font-semibold text-white leading-tight">{tile.name}</p>
                  <p className="text-[9px] text-white/15 mt-0.5 font-medium">{tile.software}</p>
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-[0.1em] ${status.color}`}>{status.label}</span>
                {status.badge === '❌' && (
                  <div className="absolute inset-0 rounded-2xl bg-surface-50/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-250">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-500/12 border border-accent-500/15">
                      <Download size={11} className="text-accent-400" /><span className="text-[10px] text-accent-400 font-bold">Install</span>
                    </div>
                  </div>
                )}
                {status.badge === '✅' && (
                  <div className="absolute inset-0 rounded-2xl bg-surface-50/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-250">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-success-500/12 border border-success-500/15">
                      <Play size={11} className="text-success-400" /><span className="text-[10px] text-success-400 font-bold">Open</span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom: Mission Log + Storage */}
      <div className="grid grid-cols-5 gap-3 relative z-10">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="col-span-3 glass-card gradient-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.03]">
            <h2 className="text-[13px] font-bold text-white flex items-center gap-2">
              <Activity size={13} className="text-success-400" /> Mission Log
            </h2>
            {agentMode === 'autopilot' && (
              <span className="flex items-center gap-1.5 text-[9px] text-success-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse-dot" />AUTONOMOUS
              </span>
            )}
            {agentMode === 'spectator' && <span className="flex items-center gap-1 text-[9px] text-accent-400 font-bold"><Eye size={9} /> WATCHING</span>}
            {agentMode === 'copilot' && <span className="flex items-center gap-1 text-[9px] text-amber-400 font-bold"><UserCog size={9} /> APPROVAL</span>}
          </div>
          <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
            {executions.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bot size={24} className="text-white/[0.05] mx-auto mb-3" />
                <p className="text-[12px] text-white/15 font-medium">No missions yet</p>
                <p className="text-[10px] text-white/8 mt-1">
                  {agentMode === 'autopilot' && 'Actions log here automatically'}
                  {agentMode === 'spectator' && 'Watch actions stream in real-time'}
                  {agentMode === 'copilot' && 'Proposals appear here for approval'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.02]">
                {executions.slice().reverse().map((exec) => {
                  const time = exec.completed_at || exec.started_at;
                  const timeStr = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  const icons: Record<string, React.ReactNode> = {
                    completed: <CheckCircle2 size={11} className="text-success-400" />,
                    failed: <XCircle size={11} className="text-error-400" />,
                    running: <Activity size={11} className="text-warning-400 animate-spin" />,
                    queued: <Clock size={11} className="text-white/15" />,
                    pending_approval: <AlertTriangle size={11} className="text-amber-400" />,
                  };
                  return (
                    <motion.div key={exec.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.015] transition-colors">
                      {icons[exec.status] || icons.queued}
                      <span className="flex-1 text-[11px] text-white/40 truncate font-mono">{exec.tool_id}</span>
                      {exec.duration_ms && <span className="text-[9px] text-white/12 font-mono">{exec.duration_ms}ms</span>}
                      <span className="text-[9px] text-white/8">{timeStr}</span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="col-span-2 glass-card gradient-border rounded-2xl p-5">
          <h2 className="text-[13px] font-bold text-white/40 flex items-center gap-2 mb-4">
            <HardDrive size={13} className="text-white/15" /> Storage
          </h2>
          {systemScan && systemScan.disks.length > 0 ? (
            <div className="space-y-4">
              {systemScan.disks.slice(0, 4).map((disk, i) => {
                const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-white/30 font-semibold">{disk.mount_point}</span>
                      <span className="text-[9px] text-white/12 font-mono">{disk.available_gb.toFixed(0)}G free</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${usedPct}%` }}
                        transition={{ delay: 0.6 + i * 0.06, duration: 0.6 }}
                        className={`h-full rounded-full ${usedPct > 90 ? 'bg-error-400' : usedPct > 70 ? 'bg-warning-400' : 'bg-accent-400/60'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-[10px] text-white/10">Loading...</p>}
        </motion.div>
      </div>

      {/* Launch toast */}
      <AnimatePresence>
        {launchMsg && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-2xl glass-elevated flex items-center gap-2.5">
            <ArrowUpRight size={13} className="text-success-400" />
            <span className="text-[11px] text-white/50 font-medium">{launchMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>{installInfo && <InstallModal info={installInfo} onClose={() => setInstallInfo(null)} />}</AnimatePresence>
    </div>
  );
}
