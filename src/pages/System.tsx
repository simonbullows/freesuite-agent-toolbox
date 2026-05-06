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
    <div className="flex-1 overflow-y-auto px-8 pb-12">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">System Monitor</h1>
            <p className="text-zinc-500 text-sm mt-1">
              {systemScan ? `${systemScan.hostname} · ${new Date(systemScan.scanned_at).toLocaleTimeString()}` : 'Scanning...'}
            </p>
          </div>
          <button
            onClick={() => { scanSystem(); fetchProcesses(sortBy); }}
            disabled={scanningSystem}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={scanningSystem ? 'animate-spin' : ''} /> Refresh
          </button>
        </motion.div>

        {/* Specs */}
        {systemScan && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Cpu,         label: 'Processor',        value: systemScan.cpu_brand, sub: `${systemScan.cpu_cores} logical cores` },
              { icon: MemoryStick, label: 'Memory',           value: `${systemScan.total_memory_gb.toFixed(0)} GB Total`, sub: `${systemScan.used_memory_gb.toFixed(1)} GB used (${((systemScan.used_memory_gb / systemScan.total_memory_gb) * 100).toFixed(0)}%)`, bar: (systemScan.used_memory_gb / systemScan.total_memory_gb) * 100 },
              { icon: Monitor,     label: 'Operating System', value: systemScan.os_name, sub: `v${systemScan.os_version}` },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800"
              >
                <div className="flex items-center gap-2 text-zinc-500 mb-3">
                  <card.icon size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">{card.label}</span>
                </div>
                <p className="text-sm font-bold text-white leading-tight mb-1">{card.value}</p>
                {card.bar !== undefined && (
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${card.bar}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  </div>
                )}
                <p className="text-xs text-zinc-500">{card.sub}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Storage */}
        {systemScan && systemScan.disks.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <HardDrive size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Storage Volumes</span>
            </div>
            <div className="space-y-4">
              {systemScan.disks.map((disk, i) => {
                const usedPct = ((disk.total_gb - disk.available_gb) / disk.total_gb) * 100;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-300 font-medium">{disk.mount_point}</span>
                      <span className="text-xs text-zinc-600 font-mono">{disk.fs_type} · {disk.total_gb.toFixed(0)}G</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usedPct}%` }}
                        transition={{ delay: 0.35 + i * 0.05, duration: 0.5 }}
                        className={`h-full rounded-full ${usedPct > 90 ? 'bg-red-500' : usedPct > 70 ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
                      />
                    </div>
                    <p className="text-xs text-zinc-600">{disk.available_gb.toFixed(0)}G free · {usedPct.toFixed(0)}% used</p>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Processes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl bg-zinc-900/50 border border-zinc-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <span className="font-bold">Top Processes</span>
            <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
              {['memory', 'cpu', 'name'].map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-4 py-1.5 rounded text-xs font-bold transition-colors capitalize ${
                    sortBy === s ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loadingProcesses ? (
              <div className="py-10 text-center text-zinc-600">Loading...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-zinc-500 text-left text-xs border-b border-zinc-800/50">
                    <th className="px-5 py-3 font-bold w-16">PID</th>
                    <th className="px-5 py-3 font-bold">Name</th>
                    <th className="px-5 py-3 font-bold text-right w-20">CPU</th>
                    <th className="px-5 py-3 font-bold text-right w-24">Memory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {processes.map((proc) => (
                    <tr key={proc.pid} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-2.5 font-mono text-zinc-600">{proc.pid}</td>
                      <td className="px-5 py-2.5 text-zinc-300 truncate max-w-[200px]">{proc.name}</td>
                      <td className="px-5 py-2.5 text-right font-mono text-zinc-400">{proc.cpu_usage.toFixed(1)}%</td>
                      <td className="px-5 py-2.5 text-right font-mono text-zinc-400">{proc.memory_mb.toFixed(0)} MB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
