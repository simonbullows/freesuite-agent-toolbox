import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Globe, Server, Key, FolderOpen, Mail, Save, Check } from 'lucide-react';
import { useToolboxStore, ConfigData } from '../stores/toolboxStore';

function SettingSection({
  icon: Icon, iconColor, title, desc, delay, children,
}: {
  icon: React.ElementType; iconColor: string; title: string; desc: string; delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass rounded-xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${iconColor} flex items-center justify-center`}>
          <Icon size={13} className="text-current" />
        </div>
        <div>
          <h2 className="text-[13px] font-semibold text-white">{title}</h2>
          <p className="text-[10px] text-white/20">{desc}</p>
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
    <div className="space-y-1">
      <label className="text-[9px] text-white/25 uppercase tracking-widest font-bold">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white text-[12px] ${mono ? 'font-mono' : ''} outline-none focus:border-accent-500/25 transition-colors placeholder:text-white/10`}
      />
    </div>
  );
}

export function SettingsPage() {
  const { config, configLoading, configSaving, configSaved, loadConfig, saveConfig } = useToolboxStore();
  const [draft, setDraft] = useState<ConfigData | null>(null);

  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { if (config && !draft) setDraft({ ...config }); }, [config]);

  const update = (field: keyof ConfigData, value: string | number) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  const handleSave = () => {
    if (!draft) return;
    saveConfig(draft);
  };

  if (configLoading || !draft) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <p className="text-white/20 text-[12px]">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[800px] mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Settings</h1>
          <p className="text-white/20 text-[12px] mt-0.5 font-medium">
            Configure agent connections and tool preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={configSaving}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-bold transition-all ${
            configSaved
              ? 'bg-success-500/15 text-success-400 border border-success-500/20'
              : 'bg-accent-500/15 text-accent-400 border border-accent-500/20 hover:bg-accent-500/25'
          } disabled:opacity-50`}
        >
          {configSaved ? <Check size={12} /> : <Save size={12} />}
          {configSaving ? 'Saving...' : configSaved ? 'Saved!' : 'Save Settings'}
        </button>
      </motion.div>

      {/* MCP Server */}
      <SettingSection icon={Server} iconColor="bg-accent-500/10 text-accent-400" title="MCP Server" desc="Expose tools to agents via MCP protocol" delay={0.04}>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="Port" type="number" value={draft.mcp_port} onChange={(v) => update('mcp_port', parseInt(v) || 3100)} mono />
          <div className="space-y-1">
            <label className="text-[9px] text-white/25 uppercase tracking-widest font-bold">Status</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
              <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
              <span className="text-[12px] text-white/25">Not running</span>
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Obsidian */}
      <SettingSection icon={FolderOpen} iconColor="bg-violet-500/10 text-violet-400" title="Obsidian Vault" desc="Knowledge base path for agent access" delay={0.08}>
        <InputField label="Vault Path" value={draft.obsidian_vault_path} onChange={(v) => update('obsidian_vault_path', v)} mono />
      </SettingSection>

      {/* LLM Provider */}
      <SettingSection icon={Globe} iconColor="bg-success-500/10 text-success-400" title="LLM Provider" desc="Connect to local or remote language models" delay={0.12}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] text-white/25 uppercase tracking-widest font-bold">Provider</label>
            <select
              value={draft.llm_provider}
              onChange={(e) => update('llm_provider', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.05] text-white text-[12px] outline-none focus:border-accent-500/25 transition-colors appearance-none"
            >
              <option value="ollama">Ollama (localhost:11434)</option>
              <option value="lmstudio">LM Studio (localhost:1234)</option>
              <option value="openai">OpenAI API</option>
            </select>
          </div>
          <InputField label="Model" value={draft.llm_model} onChange={(v) => update('llm_model', v)} mono />
        </div>
      </SettingSection>

      {/* Email */}
      <SettingSection icon={Mail} iconColor="bg-emerald-500/10 text-emerald-400" title="Email (SMTP/IMAP)" desc="Credentials for agent email access" delay={0.16}>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="SMTP Host" value={draft.smtp_host} onChange={(v) => update('smtp_host', v)} mono placeholder="smtp.gmail.com" />
          <InputField label="SMTP Port" type="number" value={draft.smtp_port} onChange={(v) => update('smtp_port', parseInt(v) || 587)} mono />
          <InputField label="Username" value={draft.smtp_username} onChange={(v) => update('smtp_username', v)} placeholder="you@example.com" />
          <InputField label="Password" type="password" value={draft.smtp_password} onChange={(v) => update('smtp_password', v)} />
        </div>
      </SettingSection>

      {/* API Keys */}
      <SettingSection icon={Key} iconColor="bg-warning-500/10 text-warning-400" title="Agent Access Key" desc="Authentication for external agent connections" delay={0.2}>
        <InputField label="API Key" type="password" value={draft.api_key} onChange={(v) => update('api_key', v)} mono placeholder="Leave blank to auto-generate on first MCP start" />
      </SettingSection>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="glass rounded-xl p-4 flex items-center gap-2.5"
      >
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <SettingsIcon size={13} className="text-white/20" />
        </div>
        <div>
          <p className="text-[12px] font-semibold text-white/40">FreeSuite.AI Agent Toolbox</p>
          <p className="text-[10px] text-white/15 font-mono">v0.1.0 · freesuite.ai</p>
        </div>
      </motion.div>
    </div>
  );
}
