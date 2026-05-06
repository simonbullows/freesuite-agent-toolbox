import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon, Globe, Server, Key, FolderOpen, Mail, Save, Check, ChevronRight,
} from 'lucide-react';
import { useToolboxStore, ConfigData } from '../stores/toolboxStore';

interface SettingSection {
  id: string; label: string; icon: React.ElementType; description: string;
}

const sections: SettingSection[] = [
  { id: 'mcp',      label: 'MCP Server',     icon: Server,     description: 'Expose tools to agents via MCP protocol' },
  { id: 'obsidian',  label: 'Obsidian Vault', icon: FolderOpen, description: 'Knowledge base path for agent access' },
  { id: 'llm',      label: 'LLM Provider',   icon: Globe,      description: 'Connect to local or remote language models' },
  { id: 'email',    label: 'Email',          icon: Mail,       description: 'Credentials for agent email access' },
  { id: 'api',      label: 'Agent Access Key', icon: Key,       description: 'Authentication for external agents' },
];

function InputField({ label, type = 'text', value, onChange, mono = false, placeholder }: {
  label: string; type?: string; value: string | number; onChange: (v: string) => void; mono?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-sm ${mono ? 'font-mono' : ''} focus:outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-700`} />
    </div>
  );
}

export function SettingsPage() {
  const { config, configLoading, configSaving, configSaved, loadConfig, saveConfig } = useToolboxStore();
  const [draft, setDraft] = useState<ConfigData | null>(null);
  const [activeSection, setActiveSection] = useState('mcp');

  useEffect(() => { loadConfig(); }, []);
  useEffect(() => { if (config && !draft) setDraft({ ...config }); }, [config]);

  const update = (field: keyof ConfigData, value: string | number) => { if (!draft) return; setDraft({ ...draft, [field]: value }); };
  const handleSave = () => { if (!draft) return; saveConfig(draft); };

  if (configLoading || !draft) {
    return <div className="p-8 flex items-center justify-center h-full"><p className="text-zinc-500">Loading settings...</p></div>;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'mcp':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Port" type="number" value={draft.mcp_port} onChange={(v) => update('mcp_port', parseInt(v) || 3100)} mono />
                <div>
                  <label className="text-xs text-zinc-500 block mb-1.5">Status</label>
                  <div className="flex items-center gap-2.5 px-4 py-3 bg-black border border-zinc-800 rounded-xl">
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                    <span className="text-sm text-zinc-500">Not running</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'obsidian':
        return (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <InputField label="Vault Path" value={draft.obsidian_vault_path} onChange={(v) => update('obsidian_vault_path', v)} mono />
          </div>
        );
      case 'llm':
        return (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-zinc-500 block mb-1.5">Provider</label>
                <select value={draft.llm_provider} onChange={(e) => update('llm_provider', e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer">
                  <option value="ollama">Ollama (localhost:11434)</option>
                  <option value="lmstudio">LM Studio (localhost:1234)</option>
                  <option value="openai">OpenAI API</option>
                </select>
              </div>
              <InputField label="Model" value={draft.llm_model} onChange={(v) => update('llm_model', v)} mono />
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField label="SMTP Host" value={draft.smtp_host} onChange={(v) => update('smtp_host', v)} mono placeholder="smtp.gmail.com" />
              <InputField label="SMTP Port" type="number" value={draft.smtp_port} onChange={(v) => update('smtp_port', parseInt(v) || 587)} mono />
              <InputField label="Username" value={draft.smtp_username} onChange={(v) => update('smtp_username', v)} placeholder="you@example.com" />
              <InputField label="Password" type="password" value={draft.smtp_password} onChange={(v) => update('smtp_password', v)} />
            </div>
          </div>
        );
      case 'api':
        return (
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <InputField label="API Key" type="password" value={draft.api_key} onChange={(v) => update('api_key', v)} mono placeholder="Leave blank to auto-generate on first MCP start" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Settings sidebar */}
      <div className="w-72 border-r border-surface-highlight flex flex-col">
        <div className="p-6 border-b border-surface-highlight">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-surface-highlight rounded-lg"><SettingsIcon size={20} /></div>
            <div>
              <h2 className="text-xl font-bold">Settings</h2>
              <p className="text-xs text-zinc-500">Configure your toolbox</p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <button key={section.id} onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900/40'
                  }`}>
                  <Icon size={18} />
                  <div className="flex-1"><p className="font-medium text-sm">{section.label}</p></div>
                  {isActive && <ChevronRight size={16} className="text-zinc-400" />}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-surface-highlight">
          <div className="text-xs text-zinc-600 text-center">
            <p>FREESUITE v0.1.0</p>
            <p>© 2026 FREESUITE.AI</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <motion.div key={activeSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">{sections.find(s => s.id === activeSection)?.label}</h2>
              <button onClick={handleSave} disabled={configSaving}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold rounded-lg text-sm transition-colors ${
                  configSaved
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                } disabled:opacity-50`}>
                {configSaved ? <Check size={14} /> : <Save size={14} />}
                {configSaving ? 'Saving...' : configSaved ? 'Saved!' : 'Save'}
              </button>
            </div>
            <p className="text-zinc-500 mb-8">{sections.find(s => s.id === activeSection)?.description}</p>
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
