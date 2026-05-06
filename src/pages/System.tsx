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
    <div className="p-6 max-w-[1000px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Monitor</h1>
          <p className="text-white/20 text-[12px] mt-0.5 font-medium">
            {systemScan ? `${systemScan.hostname} · ${new Date(systemScan.scanned_at).toLocaleTimeString()}` : 'Scanning...'}
          </p>
        </div>
        <button
          onClick={() => { scanSystem(); fetchProcesses(sortBy); }}
          disabled={scanningSystem}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.05] text-white/40 hover:text-white/70 hover:bg-white/[0.06] text-[11px] font-semibold transition-all disabled:opacity-30"
        >
          <RefreshCw size={12} className={scanningSystem ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* Specs */}
      {systemScan && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Cpu,         label: 'Processor',        value: systemScan.cpu_brand, sub: `${systemScan.cpu_cores} logical cores` },
            { icon: MemoryStick, label: 'Memory',           value: `${systemScan.total_memory_gb.toFixed(0)} GB Total`, sub: `${systemScan.used_memory_gb.toFixed(1)} GB used (${((systemScan.used_memory_gb / systemScan.total_memory_gb) * 100).toFixed(0)}%)`, bar: (systemScan.used_memory_gb / systemScan.total_memory_gb) * 100 },
            { icon: Monitor,     label: 'Operating System', value: systemScan.os_name, sub: `v${systemScan.os_version}` },
          ].map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 + i * 0.04 }}
              className="glass rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center gap-2 text-white/25">
                <card.icon size={13} />
                <span className="text-[10px] font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              <p className="text-[13px] font-semibold text-white leading-tight">{card.value}</p>
              {card.bar !== undefined && (
                <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.bar}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full bg-accent-400/70"
                  />
                </div>
              )}
              <p className="text-[10px] text-white/20">{card.sub}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Storage */}
      {systemScan && systemScan.disks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-white/25">
            <HardDrive size={13} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Storage Volumes</span>
          </div>
          <div className="space-y-3">
            {systemScan.disks.map((disk, i) => {
              const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-white/45 font-medium">{disk.mount_point}</span>
                    <span className="text-[9px] text-white/15 font-mono">{disk.fs_type} · {disk.total_gb.toFixed(0)}G</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usedPct}%` }}
                      transition={{ delay: 0.2 + i * 0.04, duration: 0.5 }}
                      className={`h-full rounded-full ${usedPct > 90 ? 'bg-error-400' : usedPct > 70 ? 'bg-warning-400' : 'bg-accent-400/70'}`}
                    />
                  </div>
                  <p className="text-[9px] text-white/12">{disk.available_gb.toFixed(0)}G free · {usedPct.toFixed(0)}% used</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Processes */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.03]">
          <span className="text-[12px] font-semibold text-white">Top Processes</span>
          <div className="flex items-center gap-0.5 text-[10px]">
            {['memory', 'cpu', 'name'].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-1 rounded-md transition-colors capitalize font-medium ${
                  sortBy === s ? 'bg-white/[0.06] text-white/70' : 'text-white/20 hover:text-white/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {loadingProcesses ? (
            <div className="py-8 text-center text-white/15 text-[11px]">Loading...</div>
          ) : (
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-white/15 text-left border-b border-white/[0.02]">
                  <th className="px-4 py-2 font-semibold w-16">PID</th>
                  <th className="px-4 py-2 font-semibold">Name</th>
                  <th className="px-4 py-2 font-semibold text-right w-20">CPU</th>
                  <th className="px-4 py-2 font-semibold text-right w-24">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.015]">
                {processes.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-white/[0.015] transition-colors">
                    <td className="px-4 py-1.5 font-mono text-white/15">{proc.pid}</td>
                    <td className="px-4 py-1.5 text-white/40 truncate max-w-[200px]">{proc.name}</td>
                    <td className="px-4 py-1.5 text-right font-mono text-white/25">{proc.cpu_usage.toFixed(1)}%</td>
                    <td className="px-4 py-1.5 text-right font-mono text-white/25">{proc.memory_mb.toFixed(0)} MB</td>
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
