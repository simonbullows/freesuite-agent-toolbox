import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, Bot } from 'lucide-react';

const statusConfig = {
  completed:        { icon: CheckCircle2,  color: 'text-green-400',  bg: 'bg-green-500/10',   border: 'border-green-400/20', label: 'Completed' },
  failed:           { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10',     border: 'border-red-400/20',   label: 'Failed' },
  running:          { icon: Loader2,       color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-400/20', label: 'Running' },
  queued:           { icon: Clock,         color: 'text-zinc-500',   bg: 'bg-zinc-800/50',    border: 'border-zinc-700',     label: 'Queued' },
  pending_approval: { icon: AlertTriangle, color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-400/20', label: 'Pending' },
};

export function ActivityPage() {
  const { executions, fetchExecutions } = useToolboxStore();
  useEffect(() => { fetchExecutions(); }, []);

  return (
    <div className="flex-1 overflow-y-auto px-8 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Activity Log</h1>
          <p className="text-zinc-500 text-sm mt-1">Mission history and agent execution trace</p>
        </motion.div>

        {executions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center"
          >
            <Bot size={40} className="text-zinc-700 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-zinc-400">No activity yet</h2>
            <p className="text-sm text-zinc-600 mt-2 max-w-sm mx-auto leading-relaxed">
              When agents invoke tools, each execution will be logged here with timestamps,
              inputs, outputs, and performance metrics.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {[...executions].reverse().map((exec, i) => {
              const config = statusConfig[exec.status as keyof typeof statusConfig] || statusConfig.queued;
              const StatusIcon = config.icon;
              return (
                <motion.div
                  key={exec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                    <StatusIcon size={14} className={`${config.color} ${exec.status === 'running' ? 'animate-spin' : ''}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono text-zinc-300">{exec.tool_id}</code>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border} border font-bold`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      by <span className="text-zinc-400">{exec.invoked_by}</span>
                      {exec.started_at && ` · ${new Date(exec.started_at).toLocaleTimeString()}`}
                    </p>
                  </div>
                  {exec.duration_ms != null && <span className="text-xs font-mono text-zinc-600">{exec.duration_ms}ms</span>}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
