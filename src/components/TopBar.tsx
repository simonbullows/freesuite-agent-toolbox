import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Wrench, Activity, Monitor, Settings,
  Search, Bell,
} from 'lucide-react';

const pageInfo: Record<string, { icon: React.ElementType; title: string; subtitle: string }> = {
  '/dashboard': { icon: LayoutDashboard, title: 'Dashboard', subtitle: 'Agent control plane' },
  '/tools':     { icon: Wrench,          title: 'Tool Registry', subtitle: 'Browse and manage available tools' },
  '/activity':  { icon: Activity,        title: 'Activity Log', subtitle: 'Mission history and execution trace' },
  '/system':    { icon: Monitor,         title: 'System Monitor', subtitle: 'Hardware and process overview' },
  '/settings':  { icon: Settings,        title: 'Settings', subtitle: 'Configure your toolbox' },
};

export function TopBar() {
  const location = useLocation();
  const info = pageInfo[location.pathname] || pageInfo['/dashboard'];
  const Icon = info.icon;

  // Don't render on dashboard (it has its own hero) or settings (has its own header)
  if (location.pathname === '/dashboard' || location.pathname === '/settings') return null;

  return (
    <div className="flex items-center justify-between px-8 py-5 bg-transparent z-10 relative border-b border-zinc-900/50">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 bg-zinc-900 rounded-lg">
          <Icon size={18} className="text-zinc-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">{info.title}</h1>
          <p className="text-xs text-zinc-500">{info.subtitle}</p>
        </div>
      </motion.div>

      <div className="flex items-center gap-2">
        <button className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
          <Search size={16} />
        </button>
        <button className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors relative">
          <Bell size={16} />
        </button>
      </div>
    </div>
  );
}
