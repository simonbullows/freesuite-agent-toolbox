import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import { Activity, CheckCircle2, XCircle, Clock, Loader2 } from 'lucide-react';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-400/10', label: 'Completed' },
  failed: { icon: XCircle, color: 'text-error-400', bg: 'bg-error-400/10', label: 'Failed' },
  running: { icon: Loader2, color: 'text-warning-400', bg: 'bg-warning-400/10', label: 'Running' },
  queued: { icon: Clock, color: 'text-white/30', bg: 'bg-white/[0.05]', label: 'Queued' },
};

export function ActivityPage() {
  const { executions, fetchExecutions } = useToolboxStore();

  useEffect(() => {
    fetchExecutions();
  }, []);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Activity Log</h1>
        <p className="text-white/30 text-sm mt-1">
          Tool execution history and agent activity
        </p>
      </motion.div>

      {executions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-white/10" />
          </div>
          <h2 className="text-[16px] font-semibold text-white/40">No activity yet</h2>
          <p className="text-[13px] text-white/20 mt-2 max-w-md mx-auto">
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
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon size={14} className={`${config.color} ${exec.status === 'running' ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[13px] font-mono text-white/70">{exec.tool_id}</code>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} font-bold uppercase`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/20 mt-0.5">
                    Invoked by <span className="text-white/30">{exec.invoked_by}</span>
                    {exec.started_at && ` · ${new Date(exec.started_at).toLocaleTimeString()}`}
                  </p>
                </div>
                {exec.duration_ms != null && (
                  <span className="text-[12px] font-mono text-white/20">
                    {exec.duration_ms}ms
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
