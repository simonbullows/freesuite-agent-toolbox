import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, Bot } from 'lucide-react';

const statusConfig = {
  completed:        { icon: CheckCircle2,  color: 'text-success-400', bg: 'bg-success-400/10', label: 'Completed' },
  failed:           { icon: XCircle,       color: 'text-error-400',   bg: 'bg-error-400/10',   label: 'Failed' },
  running:          { icon: Loader2,       color: 'text-warning-400', bg: 'bg-warning-400/10', label: 'Running' },
  queued:           { icon: Clock,         color: 'text-white/25',    bg: 'bg-white/[0.04]',   label: 'Queued' },
  pending_approval: { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-400/10',   label: 'Pending' },
};

export function ActivityPage() {
  const { executions, fetchExecutions } = useToolboxStore();

  useEffect(() => { fetchExecutions(); }, []);

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Activity Log</h1>
        <p className="text-white/20 text-[12px] mt-0.5 font-medium">
          Mission history and agent execution trace
        </p>
      </motion.div>

      {executions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-10 text-center"
        >
          <Bot size={24} className="text-white/8 mx-auto mb-3" />
          <h2 className="text-[14px] font-semibold text-white/30">No activity yet</h2>
          <p className="text-[11px] text-white/15 mt-1 max-w-sm mx-auto leading-relaxed">
            When agents invoke tools, each execution will be logged here with timestamps,
            inputs, outputs, and performance metrics.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-1.5">
          {[...executions].reverse().map((exec, i) => {
            const config = statusConfig[exec.status as keyof typeof statusConfig] || statusConfig.queued;
            const StatusIcon = config.icon;
            return (
              <motion.div
                key={exec.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="glass rounded-lg p-3.5 flex items-center gap-3 hover:bg-white/[0.015] transition-colors"
              >
                <div className={`w-7 h-7 rounded-md ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon size={12} className={`${config.color} ${exec.status === 'running' ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[12px] font-mono text-white/60">{exec.tool_id}</code>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded ${config.bg} ${config.color} font-bold uppercase tracking-wide`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/15 mt-0.5">
                    by <span className="text-white/25">{exec.invoked_by}</span>
                    {exec.started_at && ` · ${new Date(exec.started_at).toLocaleTimeString()}`}
                  </p>
                </div>
                {exec.duration_ms != null && (
                  <span className="text-[10px] font-mono text-white/15">{exec.duration_ms}ms</span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
