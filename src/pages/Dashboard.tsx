import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolboxStore, type AgentMode, type ToolCapability } from '../stores/toolboxStore';
import {
  FileText,
  FileStack,
  Image,
  Film,
  StickyNote,
  Box,
  Users,
  Mail,
  LayoutGrid,
  Music,
  Cpu,
  HardDrive,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Bot,
  Eye,
  UserCog,
  AlertTriangle,
  Download,
  Play,
  Zap,
} from 'lucide-react';

// ── App Tile Data ──
interface AppTile {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
  software: string;
  capabilityKey?: string; // matches ToolCapability.tool
  gradient: string;
  iconColor: string;
}

const APP_TILES: AppTile[] = [
  { id: 'docs',    name: 'Docs',      icon: FileText,   category: 'office',    software: 'LibreOffice',      capabilityKey: 'LibreOffice',      gradient: 'from-blue-500/15 to-blue-600/5',    iconColor: 'text-blue-400' },
  { id: 'pdf',     name: 'PDF',       icon: FileStack,  category: 'pdf',       software: 'Stirling PDF',     capabilityKey: 'Stirling PDF',     gradient: 'from-red-500/15 to-red-600/5',      iconColor: 'text-red-400' },
  { id: 'image',   name: 'Image Gen', icon: Image,      category: 'ai_gen',    software: 'ComfyUI',          capabilityKey: 'ComfyUI (SD 1.5)', gradient: 'from-purple-500/15 to-purple-600/5', iconColor: 'text-purple-400' },
  { id: 'video',   name: 'Video',     icon: Film,       category: 'media',     software: 'FFmpeg',           capabilityKey: 'FFmpeg',           gradient: 'from-amber-500/15 to-amber-600/5',  iconColor: 'text-amber-400' },
  { id: 'notes',   name: 'Notes',     icon: StickyNote,  category: 'knowledge', software: 'Obsidian',         capabilityKey: 'Obsidian',         gradient: 'from-violet-500/15 to-violet-600/5', iconColor: 'text-violet-400' },
  { id: '3d',      name: '3D',        icon: Box,        category: '3d',        software: 'Blender',          capabilityKey: 'Blender',          gradient: 'from-orange-500/15 to-orange-600/5', iconColor: 'text-orange-400' },
  { id: 'crm',     name: 'CRM',       icon: Users,      category: 'crm',       software: 'Twenty',           gradient: 'from-cyan-500/15 to-cyan-600/5',    iconColor: 'text-cyan-400' },
  { id: 'email',   name: 'Email',     icon: Mail,       category: 'email',     software: 'IMAP/SMTP',        gradient: 'from-emerald-500/15 to-emerald-600/5', iconColor: 'text-emerald-400' },
  { id: 'project', name: 'Projects',  icon: LayoutGrid, category: 'project',   software: 'Plane',            gradient: 'from-indigo-500/15 to-indigo-600/5', iconColor: 'text-indigo-400' },
  { id: 'music',   name: 'Music',     icon: Music,      category: 'music',     software: 'ACE-Step',         capabilityKey: 'ACE-Step (base)',   gradient: 'from-pink-500/15 to-pink-600/5',    iconColor: 'text-pink-400' },
];

// ── Status Badge ──
function getStatus(tile: AppTile, caps: ToolCapability[]): { badge: string; label: string; color: string } {
  const cap = caps.find(c => c.tool === tile.capabilityKey);
  if (!cap) {
    // Not in capability gate — check if it's a service-based tool
    if (['crm', 'email', 'project'].includes(tile.category)) {
      return { badge: '🔶', label: 'Configure', color: 'text-warning-400' };
    }
    return { badge: '❌', label: 'Not installed', color: 'text-white/30' };
  }
  if (cap.installed && (cap.status === 'local' || cap.status === 'cpu_only')) {
    return { badge: '✅', label: 'Ready', color: 'text-success-400' };
  }
  if (cap.installed && cap.status === 'tight') {
    return { badge: '⚠️', label: 'Tight VRAM', color: 'text-warning-400' };
  }
  if (cap.status === 'cpu_only' && !cap.installed) {
    return { badge: '❌', label: 'Not installed', color: 'text-white/30' };
  }
  if (cap.status === 'cloud_recommended') {
    return { badge: '☁️', label: 'Cloud only', color: 'text-white/30' };
  }
  if (!cap.installed) {
    return { badge: '❌', label: 'Not installed', color: 'text-white/30' };
  }
  return { badge: '🔶', label: 'Stopped', color: 'text-warning-400' };
}

// ── Mode Selector ──
function ModeSelector({ mode, setMode }: { mode: AgentMode; setMode: (m: AgentMode) => void }) {
  const modes: { key: AgentMode; icon: React.ElementType; label: string; desc: string }[] = [
    { key: 'autopilot',  icon: Bot,     label: 'Autopilot',  desc: 'Agent works alone' },
    { key: 'spectator',  icon: Eye,     label: 'Spectator',  desc: 'Watch the agent work' },
    { key: 'copilot',    icon: UserCog, label: 'Copilot',    desc: 'Approve each action' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      {modes.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all ${
            mode === key
              ? 'bg-accent-500/20 text-accent-400 shadow-sm'
              : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'
          }`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}

// ── Stat Card ──
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = 'accent',
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: 'accent' | 'success' | 'warning' | 'error';
  delay?: number;
}) {
  const glowMap = {
    accent:  'from-accent-500/10 to-transparent border-accent-500/10',
    success: 'from-success-500/10 to-transparent border-success-500/10',
    warning: 'from-warning-500/10 to-transparent border-warning-500/10',
    error:   'from-error-500/10 to-transparent border-error-500/10',
  };
  const iconMap = {
    accent: 'text-accent-400', success: 'text-success-400',
    warning: 'text-warning-400', error: 'text-error-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`glass rounded-2xl p-5 bg-gradient-to-br ${glowMap[color]} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{label}</span>
        <Icon size={15} className={iconMap[color]} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Mission Log Entry ──
function MissionEntry({ exec }: { exec: typeof import('../stores/toolboxStore').ToolExecution.prototype extends never ? never : any }) {
  const statusIcon = {
    completed: <CheckCircle2 size={13} className="text-success-400" />,
    failed: <XCircle size={13} className="text-error-400" />,
    running: <Activity size={13} className="text-warning-400 animate-spin" />,
    queued: <Clock size={13} className="text-white/20" />,
    pending_approval: <AlertTriangle size={13} className="text-amber-400" />,
  };

  const time = exec.completed_at || exec.started_at;
  const timeStr = time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors"
    >
      <div className="shrink-0">{statusIcon[exec.status as keyof typeof statusIcon] || statusIcon.queued}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-white/70 truncate">{exec.tool_id}</p>
        {exec.error && <p className="text-[10px] text-error-400 truncate">{exec.error}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {exec.duration_ms && (
          <span className="text-[10px] text-white/20 font-mono">{exec.duration_ms}ms</span>
        )}
        <span className="text-[10px] text-white/15">{timeStr}</span>
      </div>
    </motion.div>
  );
}

// ── Main Dashboard ──
export function Dashboard() {
  const {
    tools, fetchTools,
    systemScan, scanSystem, scanningSystem,
    executions, fetchExecutions,
    capabilities, checkCapabilities,
    agentMode, setAgentMode,
  } = useToolboxStore();

  useEffect(() => {
    fetchTools();
    scanSystem();
    fetchExecutions();
    checkCapabilities();
  }, []);

  const readyTools = capabilities.filter(c => c.installed || c.status === 'cpu_only').length;
  const gpuVram = capabilities.length > 0 ? capabilities[0].your_vram_mb : 0;

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6">
      {/* Header with Mode Selector */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="bg-gradient-to-r from-accent-400 to-purple-400 bg-clip-text text-transparent">
              FreeSuite
            </span>
            <span className="text-white/20 font-light">Agent Toolbox</span>
          </h1>
          <p className="text-white/25 text-[13px] mt-1">
            {systemScan
              ? `${systemScan.hostname} · ${systemScan.os_name} · ${gpuVram > 0 ? `${(gpuVram / 1024).toFixed(0)}GB VRAM` : 'No dedicated GPU'}`
              : scanningSystem ? 'Scanning hardware...' : 'Open-source tools for AI agents'
            }
          </p>
        </div>
        <ModeSelector mode={agentMode} setMode={setAgentMode} />
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Zap}           label="Tools"     value={tools.length}  sub={`${readyTools} ready on this machine`} color="accent"  delay={0.05} />
        <StatCard icon={CheckCircle2}  label="Completed" value={executions.filter(e => e.status === 'completed').length} sub={executions.filter(e => e.status === 'failed').length > 0 ? `${executions.filter(e => e.status === 'failed').length} failed` : 'all healthy'} color="success" delay={0.1} />
        <StatCard icon={Cpu}           label="CPU"       value={systemScan ? `${systemScan.cpu_cores} cores` : '—'} sub={systemScan?.cpu_brand?.split(' ').slice(0, 3).join(' ')} color="warning" delay={0.15} />
        <StatCard icon={HardDrive}     label="Memory"    value={systemScan ? `${systemScan.used_memory_gb.toFixed(1)} GB` : '—'} sub={systemScan ? `of ${systemScan.total_memory_gb.toFixed(0)} GB total` : undefined} color="accent" delay={0.2} />
      </div>

      {/* App Launcher Grid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <LayoutGrid size={15} className="text-accent-400" />
            <h2 className="text-[14px] font-semibold text-white">Software Rack</h2>
          </div>
          <span className="text-[11px] text-white/20">
            {readyTools} of {APP_TILES.length} tools available
          </span>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {APP_TILES.map((tile, i) => {
            const status = getStatus(tile, capabilities);
            return (
              <motion.button
                key={tile.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={`group relative flex flex-col items-center gap-3 p-5 rounded-2xl bg-gradient-to-br ${tile.gradient} border border-white/[0.04] hover:border-white/[0.08] transition-all cursor-pointer`}
              >
                {/* Status badge */}
                <span className="absolute top-2.5 right-2.5 text-[12px]">{status.badge}</span>

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                  <tile.icon size={20} className={tile.iconColor} />
                </div>

                {/* Labels */}
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-white">{tile.name}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{tile.software}</p>
                </div>

                {/* Status label */}
                <span className={`text-[9px] font-medium uppercase tracking-wide ${status.color}`}>
                  {status.label}
                </span>

                {/* Install overlay for missing tools */}
                {status.badge === '❌' && (
                  <div className="absolute inset-0 rounded-2xl bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/20 border border-accent-500/30">
                      <Download size={11} className="text-accent-400" />
                      <span className="text-[10px] text-accent-400 font-medium">Install</span>
                    </div>
                  </div>
                )}

                {/* Launch overlay for ready tools */}
                {status.badge === '✅' && (
                  <div className="absolute inset-0 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success-500/20 border border-success-500/30">
                      <Play size={11} className="text-success-400" />
                      <span className="text-[10px] text-success-400 font-medium">Open</span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mission Log */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <Activity size={15} className="text-success-400" />
            <h2 className="text-[14px] font-semibold text-white">Mission Log</h2>
          </div>
          <div className="flex items-center gap-2">
            {agentMode === 'autopilot' && (
              <span className="flex items-center gap-1.5 text-[10px] text-success-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success-400 animate-pulse-dot" />
                Autonomous
              </span>
            )}
            {agentMode === 'spectator' && (
              <span className="flex items-center gap-1.5 text-[10px] text-accent-400 font-medium">
                <Eye size={10} />
                Watching
              </span>
            )}
            {agentMode === 'copilot' && (
              <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-medium">
                <UserCog size={10} />
                Approval required
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[240px] overflow-y-auto">
          {executions.length === 0 ? (
            <div className="px-5 py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto">
                <Bot size={24} className="text-white/10" />
              </div>
              <div>
                <p className="text-[13px] text-white/30">No missions yet</p>
                <p className="text-[11px] text-white/15 mt-1">
                  {agentMode === 'autopilot' && 'Agent will log actions here automatically'}
                  {agentMode === 'spectator' && 'Watch agent actions stream in real-time'}
                  {agentMode === 'copilot' && 'Agent proposals will appear here for your approval'}
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              <div className="divide-y divide-white/[0.03]">
                {executions.slice().reverse().map((exec) => (
                  <MissionEntry key={exec.id} exec={exec} />
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      {/* Storage */}
      {systemScan && systemScan.disks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={14} className="text-white/25" />
            <h2 className="text-[13px] font-semibold text-white/60">Storage</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {systemScan.disks.map((disk, i) => {
              const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/40 font-medium truncate">{disk.mount_point}</span>
                    <span className="text-[10px] text-white/20">{disk.available_gb.toFixed(0)} GB free</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usedPct}%` }}
                      transition={{ delay: 0.8 + i * 0.05, duration: 0.6 }}
                      className={`h-full rounded-full ${
                        usedPct > 90 ? 'bg-error-400' : usedPct > 70 ? 'bg-warning-400' : 'bg-accent-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
