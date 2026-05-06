import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore, type ToolSchema } from '../stores/toolboxStore';
import {
  Wrench,
  Zap,
  Terminal,
  Cpu,
  FolderOpen,
  Globe,
  StickyNote,
  Film,
  Image,
  Box,
  FileText,
  FileStack,
  Mail,
  ChevronRight,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  system: Cpu, file: FolderOpen, shell: Terminal, web: Globe,
  knowledge: StickyNote, media: Film, ai_gen: Image, '3d': Box,
  office: FileText, pdf: FileStack, email: Mail,
};

const categoryLabels: Record<string, string> = {
  system: 'System', file: 'File System', shell: 'Shell', web: 'Web',
  knowledge: 'Knowledge', media: 'Media', ai_gen: 'AI Generation', '3d': '3D Pipeline',
  office: 'Office', pdf: 'PDF', email: 'Email',
};

function ToolCard({ tool, index }: { tool: ToolSchema; index: number }) {
  const Icon = categoryIcons[tool.category] || Wrench;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="glass rounded-xl p-4 hover:bg-white/[0.02] transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-accent-500/8 flex items-center justify-center shrink-0 group-hover:bg-accent-500/12 transition-colors">
          <Icon size={14} className="text-accent-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-[13px] font-semibold text-white">{tool.name}</h3>
            {tool.is_native && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-400 font-bold uppercase tracking-wide">
                Native
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/25 mb-2 leading-relaxed">{tool.description}</p>

          {/* Parameters */}
          {tool.parameters.length > 0 && (
            <div className="space-y-1">
              {tool.parameters.map((param) => (
                <div key={param.name} className="flex items-center gap-1.5 text-[10px]">
                  <code className="font-mono text-accent-400/60 bg-accent-500/5 px-1 py-px rounded text-[9px]">
                    {param.name}
                  </code>
                  <span className="text-white/10">·</span>
                  <span className="text-white/20">{param.param_type}</span>
                  {param.required && (
                    <span className="text-error-400/50 text-[8px] font-bold">REQ</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Returns */}
          <div className="mt-2 pt-2 border-t border-white/[0.03]">
            <div className="flex items-center gap-1.5 text-[10px]">
              <ChevronRight size={8} className="text-success-400/40" />
              <span className="text-white/15">Returns</span>
              <span className="text-white/25 font-mono text-[9px]">{tool.returns}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function ToolsPage() {
  const { tools, fetchTools, loadingTools } = useToolboxStore();

  useEffect(() => { fetchTools(); }, []);

  const grouped = tools.reduce<Record<string, ToolSchema[]>>((acc, tool) => {
    if (!acc[tool.category]) acc[tool.category] = [];
    acc[tool.category].push(tool);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-[1000px] mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tool Registry</h1>
        <p className="text-white/20 text-[12px] mt-0.5 font-medium">
          {tools.length} tools · {tools.filter(t => t.is_native).length} native implementations
        </p>
      </motion.div>

      {loadingTools ? (
        <div className="text-center py-16 text-white/15 text-[12px]">Loading tools...</div>
      ) : (
        Object.entries(grouped).map(([category, categoryTools]) => {
          const CatIcon = categoryIcons[category] || Zap;
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <CatIcon size={11} className="text-white/15" />
                <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                  {categoryLabels[category] || category}
                </h2>
                <div className="flex-1 h-px bg-white/[0.03]" />
                <span className="text-[9px] text-white/10 font-mono">{categoryTools.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {categoryTools.map((tool, i) => (
                  <ToolCard key={tool.id} tool={tool} index={i} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
