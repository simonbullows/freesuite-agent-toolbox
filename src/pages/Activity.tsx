import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore } from '../stores/toolboxStore';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, AlertTriangle, Bot } from 'lucide-react';

const statusConfig = {
  completed:        { icon: CheckCircle2,  color: 'text-success-400', bg: 'bg-success-500/8',  label: 'Completed' },
  failed:           { icon: XCircle,       color: 'text-error-400',   bg: 'bg-error-500/8',    label: 'Failed' },
  running:          { icon: Loader2,       color: 'text-warning-400', bg: 'bg-warning-500/8',  label: 'Running' },
  queued:           { icon: Clock,         color: 'text-white/20',    bg: 'bg-white/[0.03]',   label: 'Queued' },
  pending_approval: { icon: AlertTriangle, color: 'text-amber-400',   bg: 'bg-amber-500/8',    label: 'Pending' },
};

export function ActivityPage() {
  const { executions, fetchExecutions } = useToolboxStore();
  useEffect(() => { fetchExecutions(); }, []);

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 relative">
      <div className="ambient-orb w-[300px] h-[300px] bg-success-500 -top-36 -right-24 animate-breathe" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <h1 className="text-[26px] font-bold text-white tracking-tight">Activity <span className="text-gradient">Log</span></h1>
        <p className="text-white/18 text-[12px] mt-1 font-medium">Mission history and agent execution trace</p>
      </motion.div>

      {executions.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          className="glass-elevated gradient-border rounded-2xl p-14 text-center relative z-10">
          <Bot size={32} className="text-white/[0.04] mx-auto mb-4" />
          <h2 className="text-[15px] font-bold text-white/20">No activity yet</h2>
          <p className="text-[11px] text-white/10 mt-2 max-w-sm mx-auto leading-relaxed">
            When agents invoke tools, each execution will be logged here with timestamps, inputs, outputs, and performance metrics.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2 relative z-10">
          {[...executions].reverse().map((exec, i) => {
            const config = statusConfig[exec.status as keyof typeof statusConfig] || statusConfig.queued;
            const StatusIcon = config.icon;
            return (
              <motion.div key={exec.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card gradient-border rounded-2xl p-4 flex items-center gap-3.5 hover:bg-white/[0.012] transition-all">
                <div className={`w-8 h-8 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                  <StatusIcon size={13} className={`${config.color} ${exec.status === 'running' ? 'animate-spin' : ''}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <code className="text-[12px] font-mono text-white/50 font-medium">{exec.tool_id}</code>
                    <span className={`text-[8px] px-2 py-0.5 rounded-lg ${config.bg} ${config.color} font-bold uppercase tracking-[0.1em]`}>{config.label}</span>
                  </div>
                  <p className="text-[10px] text-white/12 mt-1">
                    by <span className="text-white/20">{exec.invoked_by}</span>
                    {exec.started_at && ` · ${new Date(exec.started_at).toLocaleTimeString()}`}
                  </p>
                </div>
                {exec.duration_ms != null && <span className="text-[10px] font-mono text-white/12">{exec.duration_ms}ms</span>}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
