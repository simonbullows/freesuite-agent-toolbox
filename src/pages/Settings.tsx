import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Globe, Server, Key, FolderOpen, Mail, Save, Check } from 'lucide-react';
import { useToolboxStore, ConfigData } from '../stores/toolboxStore';

function SettingSection({ icon: Icon, iconColor, bgColor, title, desc, delay, children }: {
  icon: React.ElementType; iconColor: string; bgColor: string; title: string; desc: string; delay: number; children: React.ReactNode;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card gradient-border rounded-2xl p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon size={14} className={iconColor} />
        </div>
        <div>
          <h2 className="text-[14px] font-bold text-white">{title}</h2>
          <p className="text-[10px] text-white/15 font-medium">{desc}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function InputField({ label, type = 'text', value, onChange, mono = false, placeholder }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void; mono?: boolean; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-300/40 border border-white/[0.04] text-white text-[12px] ${mono ? 'font-mono' : ''} outline-none focus:border-accent-500/20 focus:bg-surface-300/60 transition-all placeholder:text-white/8`} />
    </div>
  );
}

export function SettingsPage() {
  const { config, configLoading, configSaving, configSaved, loadConfig, saveConfig } = useToolboxStore();
  const [draft, setDraft] = useState<ConfigData | null>(null);
  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { if (config && !draft) setDraft({ ...config }); }, [config]);
  const update = (field: keyof ConfigData, value: string | number) => { if (!draft) return; setDraft({ ...draft, [field]: value }); };
  const handleSave = () => { if (!draft) return; saveConfig(draft); };

  if (configLoading || !draft) {
    return <div className="p-6 flex items-center justify-center h-full"><p className="text-white/15 text-[12px]">Loading settings...</p></div>;
  }

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-4 relative">
      <div className="ambient-orb w-[300px] h-[300px] bg-accent-500 -top-32 -right-20 animate-breathe" />
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-[26px] font-bold text-white tracking-tight">Settings</h1>
          <p className="text-white/18 text-[12px] mt-1 font-medium">Configure agent connections and tool preferences</p>
        </div>
        <button onClick={handleSave} disabled={configSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
            configSaved ? 'bg-success-500/12 text-success-400 border border-success-500/15 glow-success' :
            'bg-accent-500/12 text-accent-400 border border-accent-500/15 hover:bg-accent-500/20 hover:glow-accent'
          } disabled:opacity-50`}>
          {configSaved ? <Check size={13} /> : <Save size={13} />}
          {configSaving ? 'Saving...' : configSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </motion.div>

      <SettingSection icon={Server} iconColor="text-accent-400" bgColor="bg-accent-500/8" title="MCP Server" desc="Expose tools to agents via MCP protocol" delay={0.06}>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Port" type="number" value={draft.mcp_port} onChange={(v) => update('mcp_port', parseInt(v) || 3100)} mono />
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold">Status</label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-surface-300/40 border border-white/[0.04]">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <span className="text-[12px] text-white/20">Not running</span>
            </div>
          </div>
        </div>
      </SettingSection>

      <SettingSection icon={FolderOpen} iconColor="text-violet-400" bgColor="bg-violet-500/8" title="Obsidian Vault" desc="Knowledge base path for agent access" delay={0.1}>
        <InputField label="Vault Path" value={draft.obsidian_vault_path} onChange={(v) => update('obsidian_vault_path', v)} mono />
      </SettingSection>

      <SettingSection icon={Globe} iconColor="text-success-400" bgColor="bg-success-500/8" title="LLM Provider" desc="Connect to local or remote language models" delay={0.14}>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold">Provider</label>
            <select value={draft.llm_provider} onChange={(e) => update('llm_provider', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-300/40 border border-white/[0.04] text-white text-[12px] outline-none focus:border-accent-500/20 transition-all appearance-none cursor-pointer">
              <option value="ollama">Ollama (localhost:11434)</option>
              <option value="lmstudio">LM Studio (localhost:1234)</option>
              <option value="openai">OpenAI API</option>
            </select>
          </div>
          <InputField label="Model" value={draft.llm_model} onChange={(v) => update('llm_model', v)} mono />
        </div>
      </SettingSection>

      <SettingSection icon={Mail} iconColor="text-emerald-400" bgColor="bg-emerald-500/8" title="Email (SMTP/IMAP)" desc="Credentials for agent email access" delay={0.18}>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="SMTP Host" value={draft.smtp_host} onChange={(v) => update('smtp_host', v)} mono placeholder="smtp.gmail.com" />
          <InputField label="SMTP Port" type="number" value={draft.smtp_port} onChange={(v) => update('smtp_port', parseInt(v) || 587)} mono />
          <InputField label="Username" value={draft.smtp_username} onChange={(v) => update('smtp_username', v)} placeholder="you@example.com" />
          <InputField label="Password" type="password" value={draft.smtp_password} onChange={(v) => update('smtp_password', v)} />
        </div>
      </SettingSection>

      <SettingSection icon={Key} iconColor="text-warning-400" bgColor="bg-warning-500/8" title="Agent Access Key" desc="Authentication for external agent connections" delay={0.22}>
        <InputField label="API Key" type="password" value={draft.api_key} onChange={(v) => update('api_key', v)} mono placeholder="Leave blank to auto-generate on first MCP start" />
      </SettingSection>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/[0.03] flex items-center justify-center">
          <SettingsIcon size={14} className="text-white/15" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-white/30">FreeSuite.AI Agent Toolbox</p>
          <p className="text-[10px] text-white/10 font-mono">v0.1.0 · freesuite.ai</p>
        </div>
      </motion.div>
    </div>
  );
}
