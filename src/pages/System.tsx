import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import { Cpu, HardDrive, MemoryStick, Monitor, RefreshCw } from 'lucide-react';

export function SystemPage() {
  const { systemScan, scanSystem, scanningSystem, processes, fetchProcesses, loadingProcesses } = useToolboxStore();
  const [sortBy, setSortBy] = useState('memory');

  useEffect(() => {
    scanSystem();
    fetchProcesses(sortBy);
  }, []);

  useEffect(() => {
    fetchProcesses(sortBy);
  }, [sortBy]);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">System Monitor</h1>
          <p className="text-white/30 text-sm mt-1">
            {systemScan ? `${systemScan.hostname} · Scanned ${new Date(systemScan.scanned_at).toLocaleTimeString()}` : 'Scanning...'}
          </p>
        </div>
        <button
          onClick={() => { scanSystem(); fetchProcesses(sortBy); }}
          disabled={scanningSystem}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/60 hover:text-white hover:bg-white/[0.08] text-[13px] font-medium transition-all disabled:opacity-40"
        >
          <RefreshCw size={14} className={scanningSystem ? 'animate-spin' : ''} />
          Refresh
        </button>
      </motion.div>

      {/* System Specs */}
      {systemScan && (
        <div className="grid grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white/30">
              <Cpu size={15} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Processor</span>
            </div>
            <p className="text-[15px] font-semibold text-white">{systemScan.cpu_brand}</p>
            <p className="text-[12px] text-white/25">{systemScan.cpu_cores} logical cores</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white/30">
              <MemoryStick size={15} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Memory</span>
            </div>
            <p className="text-[15px] font-semibold text-white">{systemScan.total_memory_gb.toFixed(0)} GB Total</p>
            <div className="space-y-1.5">
              <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(systemScan.used_memory_gb / systemScan.total_memory_gb) * 100}%` }}
                  transition={{ duration: 0.6 }}
                  className="h-full rounded-full bg-accent-400"
                />
              </div>
              <p className="text-[11px] text-white/20">
                {systemScan.used_memory_gb.toFixed(1)} GB used ({((systemScan.used_memory_gb / systemScan.total_memory_gb) * 100).toFixed(0)}%)
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-white/30">
              <Monitor size={15} />
              <span className="text-[11px] font-bold uppercase tracking-wider">Operating System</span>
            </div>
            <p className="text-[15px] font-semibold text-white">{systemScan.os_name}</p>
            <p className="text-[12px] text-white/25">v{systemScan.os_version}</p>
          </motion.div>
        </div>
      )}

      {/* Storage */}
      {systemScan && systemScan.disks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4 text-white/30">
            <HardDrive size={15} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Storage Volumes</span>
          </div>
          <div className="space-y-4">
            {systemScan.disks.map((disk, i) => {
              const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
              return (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] text-white/60 font-medium">{disk.mount_point}</span>
                    <span className="text-[11px] text-white/20 font-mono">{disk.fs_type} · {disk.total_gb.toFixed(0)} GB</span>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${usedPct}%` }}
                      transition={{ delay: 0.25 + i * 0.05, duration: 0.6 }}
                      className={`h-full rounded-full ${usedPct > 90 ? 'bg-error-400' : usedPct > 70 ? 'bg-warning-400' : 'bg-accent-400'}`}
                    />
                  </div>
                  <p className="text-[10px] text-white/15">
                    {disk.available_gb.toFixed(0)} GB free · {usedPct.toFixed(0)}% used
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Process List */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.04]">
          <span className="text-[14px] font-semibold text-white">Top Processes</span>
          <div className="flex items-center gap-1 text-[11px]">
            {['memory', 'cpu', 'name'].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-lg transition-colors capitalize ${sortBy === s ? 'bg-white/[0.08] text-white' : 'text-white/25 hover:text-white/50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loadingProcesses ? (
            <div className="py-8 text-center text-white/20 text-[13px]">Loading processes...</div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-white/20 text-left border-b border-white/[0.03]">
                  <th className="px-5 py-2.5 font-medium">PID</th>
                  <th className="px-5 py-2.5 font-medium">Name</th>
                  <th className="px-5 py-2.5 font-medium text-right">CPU %</th>
                  <th className="px-5 py-2.5 font-medium text-right">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {processes.map((proc) => (
                  <tr key={proc.pid} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-2 font-mono text-white/20">{proc.pid}</td>
                    <td className="px-5 py-2 text-white/50 truncate max-w-[200px]">{proc.name}</td>
                    <td className="px-5 py-2 text-right font-mono text-white/30">{proc.cpu_usage.toFixed(1)}%</td>
                    <td className="px-5 py-2 text-right font-mono text-white/30">{proc.memory_mb.toFixed(0)} MB</td>
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
