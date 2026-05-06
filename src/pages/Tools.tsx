import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore, type ToolSchema } from '../stores/toolboxStore';
import {
  Wrench,
  Zap,
  Terminal,
  Cpu,
  Download,
  ChevronRight
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  system: Cpu,
  file: Download,
  shell: Terminal,
};

function ToolCard({ tool, index }: { tool: ToolSchema; index: number }) {
  const Icon = categoryIcons[tool.category] || Wrench;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="glass rounded-2xl p-5 hover:bg-white/[0.03] transition-all cursor-pointer group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center shrink-0 group-hover:bg-accent-500/15 transition-colors">
          <Icon size={18} className="text-accent-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[14px] font-semibold text-white">{tool.name}</h3>
            {tool.is_native && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent-500/10 text-accent-400 font-bold uppercase">
                Native
              </span>
            )}
          </div>
          <p className="text-[12px] text-white/30 mb-3 leading-relaxed">{tool.description}</p>

          {/* Parameters */}
          {tool.parameters.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] text-white/20 uppercase tracking-wider font-semibold">Parameters</p>
              {tool.parameters.map((param) => (
                <div key={param.name} className="flex items-center gap-2 text-[11px]">
                  <code className="font-mono text-accent-400/70 bg-accent-500/5 px-1.5 py-0.5 rounded">
                    {param.name}
                  </code>
                  <span className="text-white/15">·</span>
                  <span className="text-white/25">{param.param_type}</span>
                  {param.required && (
                    <span className="text-error-400/60 text-[9px] font-bold">REQ</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Returns */}
          <div className="mt-3 pt-3 border-t border-white/[0.03]">
            <div className="flex items-center gap-2 text-[11px]">
              <ChevronRight size={10} className="text-success-400/50" />
              <span className="text-white/20">Returns:</span>
              <span className="text-white/30 font-mono text-[10px]">{tool.returns}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ToolsPage() {
  const { tools, fetchTools, loadingTools } = useToolboxStore();

  useEffect(() => {
    fetchTools();
  }, []);

  // Group by category
  const grouped = tools.reduce<Record<string, ToolSchema[]>>((acc, tool) => {
    const cat = tool.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Tool Registry</h1>
        <p className="text-white/30 text-sm mt-1">
          {tools.length} tools registered · {tools.filter(t => t.is_native).length} native
        </p>
      </motion.div>

      {loadingTools ? (
        <div className="text-center py-20 text-white/20">Loading tools...</div>
      ) : (
        Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Zap size={12} className="text-white/15" />
              <h2 className="text-[11px] font-bold text-white/20 uppercase tracking-widest">
                {category}
              </h2>
              <div className="flex-1 h-px bg-white/[0.04]" />
              <span className="text-[10px] text-white/10">{categoryTools.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {categoryTools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} index={i} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
