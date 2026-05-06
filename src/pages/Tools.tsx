import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToolboxStore, type ToolSchema } from '../stores/toolboxStore';
import { Wrench, Zap, Terminal, Cpu, FolderOpen, Globe, StickyNote, Film, Image, Box, FileText, FileStack, Mail, ChevronRight } from 'lucide-react';

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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card gradient-border rounded-2xl p-5 hover:bg-white/[0.015] transition-all group">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-accent-500/8 flex items-center justify-center shrink-0 group-hover:bg-accent-500/12 transition-all shadow-inner shadow-black/10">
          <Icon size={15} className="text-accent-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[13px] font-bold text-white">{tool.name}</h3>
            {tool.is_native && (
              <span className="text-[8px] px-2 py-0.5 rounded-lg bg-accent-500/8 text-accent-400 font-bold uppercase tracking-[0.1em]">Native</span>
            )}
          </div>
          <p className="text-[11px] text-white/20 mb-3 leading-relaxed">{tool.description}</p>
          {tool.parameters.length > 0 && (
            <div className="space-y-1.5">
              {tool.parameters.map((param) => (
                <div key={param.name} className="flex items-center gap-2 text-[10px]">
                  <code className="font-mono text-accent-400/50 bg-accent-500/5 px-1.5 py-0.5 rounded-md text-[9px]">{param.name}</code>
                  <span className="text-white/8">·</span>
                  <span className="text-white/15">{param.param_type}</span>
                  {param.required && <span className="text-error-400/40 text-[7px] font-bold tracking-wider">REQ</span>}
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-white/[0.03]">
            <div className="flex items-center gap-1.5 text-[10px]">
              <ChevronRight size={8} className="text-success-400/30" />
              <span className="text-white/12">Returns</span>
              <span className="text-white/20 font-mono text-[9px]">{tool.returns}</span>
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
    <div className="p-6 max-w-[1000px] mx-auto space-y-6 relative">
      <div className="ambient-orb w-[350px] h-[350px] bg-accent-500 -top-40 -right-28 animate-breathe" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
        <h1 className="text-[26px] font-bold text-white tracking-tight">Tool <span className="text-gradient">Registry</span></h1>
        <p className="text-white/18 text-[12px] mt-1 font-medium">{tools.length} tools · {tools.filter(t => t.is_native).length} native implementations</p>
      </motion.div>
      {loadingTools ? (
        <div className="text-center py-20 text-white/10 text-[12px]">Loading tools...</div>
      ) : (
        Object.entries(grouped).map(([category, categoryTools]) => {
          const CatIcon = categoryIcons[category] || Zap;
          return (
            <div key={category} className="space-y-3 relative z-10">
              <div className="flex items-center gap-2.5 px-1">
                <CatIcon size={11} className="text-white/12" />
                <h2 className="text-[10px] font-bold text-white/15 uppercase tracking-[0.15em]">{categoryLabels[category] || category}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-white/[0.04] to-transparent" />
                <span className="text-[9px] text-white/8 font-mono">{categoryTools.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {categoryTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
