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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800 border border-zinc-700 shadow-lg shrink-0">
          <Icon size={18} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold group-hover:text-blue-400 transition-colors">{tool.name}</h3>
            {tool.is_native && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-400/20">
                Native
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-500 mb-3 leading-relaxed">{tool.description}</p>

          {tool.parameters.length > 0 && (
            <div className="space-y-1.5 mb-3">
              {tool.parameters.map((param) => (
                <div key={param.name} className="flex items-center gap-2 text-xs">
                  <code className="font-mono text-blue-400/70 bg-blue-500/5 px-1.5 py-0.5 rounded text-[11px]">{param.name}</code>
                  <span className="text-zinc-700">·</span>
                  <span className="text-zinc-500">{param.param_type}</span>
                  {param.required && <span className="text-red-400/60 text-[10px] font-bold">REQ</span>}
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-1.5 text-xs">
              <ChevronRight size={10} className="text-green-400/50" />
              <span className="text-zinc-600">Returns</span>
              <span className="text-zinc-400 font-mono">{tool.returns}</span>
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
    <div className="flex-1 overflow-y-auto px-8 pb-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold tracking-tight">Tool Registry</h1>
          <p className="text-zinc-500 text-sm mt-1">{tools.length} tools · {tools.filter(t => t.is_native).length} native implementations</p>
        </motion.div>

        {loadingTools ? (
          <div className="text-center py-16 text-zinc-600">Loading tools...</div>
        ) : (
          Object.entries(grouped).map(([category, categoryTools]) => {
            const CatIcon = categoryIcons[category] || Zap;
            return (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-3 px-1">
                  <CatIcon size={14} className="text-zinc-600" />
                  <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{categoryLabels[category] || category}</h2>
                  <div className="flex-1 h-px bg-zinc-800/60" />
                  <span className="text-xs text-zinc-600 font-mono">{categoryTools.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {categoryTools.map((tool, i) => <ToolCard key={tool.id} tool={tool} index={i} />)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
