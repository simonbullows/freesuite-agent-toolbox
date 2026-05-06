import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Globe, Server, Key } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/30 text-sm mt-1">
          Configure agent connections and tool preferences
        </p>
      </motion.div>

      {/* MCP Server Config */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-500/10 flex items-center justify-center">
            <Server size={16} className="text-accent-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">MCP Server</h2>
            <p className="text-[12px] text-white/25">Expose tools to external agents via MCP protocol</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">Server Port</label>
            <input
              type="number"
              defaultValue={3100}
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-[13px] font-mono outline-none focus:border-accent-500/30 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">Status</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span className="text-[13px] text-white/30">Not running</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* LLM Config */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-success-500/10 flex items-center justify-center">
            <Globe size={16} className="text-success-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">LLM Provider</h2>
            <p className="text-[12px] text-white/25">Connect to local or remote language models</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">Provider</label>
            <select className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-[13px] outline-none focus:border-accent-500/30 transition-colors appearance-none">
              <option value="ollama">Ollama (localhost:11434)</option>
              <option value="lmstudio">LM Studio (localhost:1234)</option>
              <option value="openai">OpenAI API</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">Model</label>
            <input
              type="text"
              defaultValue="llama3"
              className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-[13px] font-mono outline-none focus:border-accent-500/30 transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* API Keys */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-warning-500/10 flex items-center justify-center">
            <Key size={16} className="text-warning-400" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">Agent Access Keys</h2>
            <p className="text-[12px] text-white/25">Authentication tokens for external agent connections</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] text-white/30 uppercase tracking-wider font-semibold">API Key</label>
          <div className="flex gap-2">
            <input
              type="password"
              defaultValue="••••••••••••••••••••"
              className="flex-1 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-[13px] font-mono outline-none focus:border-accent-500/30 transition-colors"
            />
            <button className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] text-white/50 hover:text-white text-[12px] font-medium transition-colors">
              Regenerate
            </button>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center">
            <SettingsIcon size={16} className="text-white/30" />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold text-white">About</h2>
            <p className="text-[12px] text-white/25">
              FreeSuite.AI Agent Toolbox v0.1.0 · freesuite.ai
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
