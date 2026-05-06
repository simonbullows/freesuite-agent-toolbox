import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import { Cpu, HardDrive, MemoryStick, Monitor, RefreshCw } from 'lucide-react';

export function SystemPage() {
  const { systemScan, scanSystem, scanningSystem, processes, fetchProcesses, loadingProcesses } = useToolboxStore();
  const [sortBy, setSortBy] = useState('memory');
  useEffect(() => { scanSystem(); fetchProcesses(sortBy); }, []);
  useEffect(() => { fetchProcesses(sortBy); }, [sortBy]);

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-5 relative">
      <div className="ambient-orb w-[350px] h-[350px] bg-warning-500 -top-40 -right-28 animate-breathe" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">System <span className="text-gradient-warm">Monitor</span></h1>
          <p className="text-white/18 text-[12px] mt-1 font-medium">
            {systemScan ? `${systemScan.hostname} · ${new Date(systemScan.scanned_at).toLocaleTimeString()}` : 'Scanning...'}
          </p>
        </div>
        <button onClick={() => { scanSystem(); fetchProcesses(sortBy); }} disabled={scanningSystem}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card border border-white/[0.04] text-white/30 hover:text-white/60 hover:bg-white/[0.04] text-[11px] font-semibold transition-all disabled:opacity-30">
          <RefreshCw size={12} className={scanningSystem ? 'animate-spin' : ''} /> Refresh
        </button>
      </motion.div>

      {/* Specs */}
      {systemScan && (
        <div className="grid grid-cols-3 gap-3 relative z-10">
          {[
            { icon: Cpu,         label: 'Processor',        value: systemScan.cpu_brand, sub: `${systemScan.cpu_cores} logical cores`, color: 'warning' },
            { icon: MemoryStick, label: 'Memory',           value: `${systemScan.total_memory_gb.toFixed(0)} GB Total`, sub: `${systemScan.used_memory_gb.toFixed(1)} GB used (${((systemScan.used_memory_gb / systemScan.total_memory_gb) * 100).toFixed(0)}%)`, bar: (systemScan.used_memory_gb / systemScan.total_memory_gb) * 100, color: 'accent' },
            { icon: Monitor,     label: 'Operating System', value: systemScan.os_name, sub: `v${systemScan.os_version}`, color: 'success' },
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={`glass-card gradient-border rounded-2xl p-5 space-y-3 stat-glow-${card.color}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-7 h-7 rounded-lg bg-${card.color}-500/8 flex items-center justify-center`}>
                  <card.icon size={13} className={`text-${card.color}-400`} />
                </div>
                <span className="text-[9px] font-bold text-white/15 uppercase tracking-[0.15em]">{card.label}</span>
              </div>
              <p className="text-[14px] font-bold text-white leading-tight">{card.value}</p>
              {card.bar !== undefined && (
                <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${card.bar}%` }} transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-accent-400/60" />
                </div>
              )}
              <p className="text-[10px] text-white/15">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Storage */}
      {systemScan && systemScan.disks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="glass-card gradient-border rounded-2xl p-5 relative z-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-white/[0.03] flex items-center justify-center">
              <HardDrive size={13} className="text-white/20" />
            </div>
            <span className="text-[9px] font-bold text-white/15 uppercase tracking-[0.15em]">Storage Volumes</span>
          </div>
          <div className="space-y-4">
            {systemScan.disks.map((disk, i) => {
              const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/35 font-semibold">{disk.mount_point}</span>
                    <span className="text-[9px] text-white/12 font-mono">{disk.fs_type} · {disk.total_gb.toFixed(0)}G</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${usedPct}%` }}
                      transition={{ delay: 0.22 + i * 0.04, duration: 0.5 }}
                      className={`h-full rounded-full ${usedPct > 90 ? 'bg-error-400' : usedPct > 70 ? 'bg-warning-400' : 'bg-accent-400/60'}`} />
                  </div>
                  <p className="text-[9px] text-white/8">{disk.available_gb.toFixed(0)}G free · {usedPct.toFixed(0)}% used</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Processes */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="glass-card gradient-border rounded-2xl overflow-hidden relative z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.03]">
          <span className="text-[13px] font-bold text-white">Top Processes</span>
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-surface-300/40">
            {['memory', 'cpu', 'name'].map((s) => (
              <button key={s} onClick={() => setSortBy(s)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize text-[10px] font-semibold ${
                  sortBy === s ? 'bg-white/[0.06] text-white/60 shadow-sm' : 'text-white/15 hover:text-white/30'
                }`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto scrollbar-hide">
          {loadingProcesses ? (
            <div className="py-10 text-center text-white/10 text-[11px]">Loading...</div>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-white/10 text-left border-b border-white/[0.02]">
                  <th className="px-5 py-2.5 font-bold w-16 text-[9px] uppercase tracking-[0.15em]">PID</th>
                  <th className="px-5 py-2.5 font-bold text-[9px] uppercase tracking-[0.15em]">Name</th>
                  <th className="px-5 py-2.5 font-bold text-right w-20 text-[9px] uppercase tracking-[0.15em]">CPU</th>
                  <th className="px-5 py-2.5 font-bold text-right w-24 text-[9px] uppercase tracking-[0.15em]">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.015]">
                {processes.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-white/[0.012] transition-colors">
                    <td className="px-5 py-2 font-mono text-white/12">{proc.pid}</td>
                    <td className="px-5 py-2 text-white/35 truncate max-w-[200px] font-medium">{proc.name}</td>
                    <td className="px-5 py-2 text-right font-mono text-white/20">{proc.cpu_usage.toFixed(1)}%</td>
                    <td className="px-5 py-2 text-right font-mono text-white/20">{proc.memory_mb.toFixed(0)} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
