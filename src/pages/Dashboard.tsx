import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import {
  Wrench,
  Cpu,
  HardDrive,
  Activity,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    accent: 'from-accent-500/10 to-transparent border-accent-500/10',
    success: 'from-success-500/10 to-transparent border-success-500/10',
    warning: 'from-warning-500/10 to-transparent border-warning-500/10',
    error: 'from-error-500/10 to-transparent border-error-500/10',
  };
  const iconColorMap = {
    accent: 'text-accent-400',
    success: 'text-success-400',
    warning: 'text-warning-400',
    error: 'text-error-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={`glass rounded-2xl p-5 bg-gradient-to-br ${glowMap[color]} flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-white/40 uppercase tracking-wider">{label}</span>
        <Icon size={16} className={iconColorMap[color]} />
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {sub && <p className="text-[12px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export function Dashboard() {
  const { tools, fetchTools, systemScan, scanSystem, scanningSystem, executions, fetchExecutions } = useToolboxStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTools();
    scanSystem();
    fetchExecutions();
  }, []);

  const completedExecs = executions.filter(e => e.status === 'completed').length;
  const failedExecs = executions.filter(e => e.status === 'failed').length;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Agent Control Plane
          </h1>
          <p className="text-white/30 text-sm mt-1">
            {systemScan
              ? `${systemScan.hostname} · ${systemScan.os_name} ${systemScan.os_version}`
              : scanningSystem ? 'Scanning system...' : 'FreeSuite.AI Agent Toolbox'
            }
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => scanSystem()}
          disabled={scanningSystem}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.08] text-[13px] font-medium transition-all disabled:opacity-40"
        >
          <Activity size={14} className={scanningSystem ? 'animate-spin' : ''} />
          {scanningSystem ? 'Scanning...' : 'Refresh'}
        </motion.button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={Wrench}
          label="Available Tools"
          value={tools.length}
          sub={`${tools.filter(t => t.is_native).length} native`}
          color="accent"
          delay={0.05}
        />
        <StatCard
          icon={CheckCircle2}
          label="Executions"
          value={completedExecs}
          sub={failedExecs > 0 ? `${failedExecs} failed` : 'all healthy'}
          color="success"
          delay={0.1}
        />
        <StatCard
          icon={Cpu}
          label="CPU"
          value={systemScan ? `${systemScan.cpu_cores} cores` : '—'}
          sub={systemScan?.cpu_brand?.split(' ').slice(0, 3).join(' ')}
          color="warning"
          delay={0.15}
        />
        <StatCard
          icon={HardDrive}
          label="Memory"
          value={systemScan ? `${systemScan.used_memory_gb.toFixed(1)} GB` : '—'}
          sub={systemScan ? `of ${systemScan.total_memory_gb.toFixed(0)} GB total` : undefined}
          color="accent"
          delay={0.2}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Tool Registry */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-3 glass rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Wrench size={15} className="text-accent-400" />
              <h2 className="text-[14px] font-semibold text-white">Tool Registry</h2>
            </div>
            <button
              onClick={() => navigate('/tools')}
              className="flex items-center gap-1 text-[12px] text-accent-400 hover:text-accent-300 transition-colors font-medium"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-white/[0.03]">
            {tools.slice(0, 4).map((tool) => (
              <div key={tool.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0">
                  <Zap size={14} className="text-accent-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-white truncate">{tool.name}</p>
                  <p className="text-[11px] text-white/30 truncate">{tool.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 font-medium uppercase">
                    {tool.category}
                  </span>
                  {tool.is_native && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-400 font-medium">
                      Native
                    </span>
                  )}
                </div>
              </div>
            ))}
            {tools.length === 0 && (
              <div className="px-5 py-8 text-center text-white/20 text-[13px]">
                No tools registered yet
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-2 glass rounded-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-success-400" />
              <h2 className="text-[14px] font-semibold text-white">Recent Activity</h2>
            </div>
            <button
              onClick={() => navigate('/activity')}
              className="flex items-center gap-1 text-[12px] text-accent-400 hover:text-accent-300 transition-colors font-medium"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="px-5 py-8">
            {executions.length === 0 ? (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto">
                  <Activity size={20} className="text-white/10" />
                </div>
                <div>
                  <p className="text-[13px] text-white/30">No activity yet</p>
                  <p className="text-[11px] text-white/15 mt-1">
                    Tool executions will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {executions.slice(-5).reverse().map((exec) => (
                  <div key={exec.id} className="flex items-center gap-3 py-2">
                    <div className={`w-2 h-2 rounded-full ${
                      exec.status === 'completed' ? 'bg-success-400' :
                      exec.status === 'failed' ? 'bg-error-400' :
                      exec.status === 'running' ? 'bg-warning-400 animate-pulse-dot' :
                      'bg-white/20'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-white/60 truncate">{exec.tool_id}</p>
                    </div>
                    <span className="text-[10px] text-white/20">
                      {exec.duration_ms ? `${exec.duration_ms}ms` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Disk Overview */}
      {systemScan && systemScan.disks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={15} className="text-white/30" />
            <h2 className="text-[14px] font-semibold text-white">Storage</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {systemScan.disks.map((disk, i) => {
              const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-white/40 font-medium truncate">
                      {disk.mount_point}
                    </span>
                    <span className="text-[11px] text-white/20">
                      {disk.available_gb.toFixed(0)} GB free
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usedPct}%` }}
                      transition={{ delay: 0.4 + i * 0.05, duration: 0.6 }}
                      className={`h-full rounded-full ${
                        usedPct > 90 ? 'bg-error-400' : usedPct > 70 ? 'bg-warning-400' : 'bg-accent-400'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-white/15">
                    {(disk.total_gb - disk.available_gb).toFixed(0)} / {disk.total_gb.toFixed(0)} GB ({usedPct.toFixed(0)}%)
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
