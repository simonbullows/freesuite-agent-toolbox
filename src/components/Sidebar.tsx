import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  Activity,
  Monitor,
  Settings,
  Zap,
} from 'lucide-react';
import { useToolboxStore } from '../stores/toolboxStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wrench, label: 'Tools', path: '/tools' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Monitor, label: 'System', path: '/system' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { tools, agentMode } = useToolboxStore();

  const modeLabel = { autopilot: 'Autopilot', spectator: 'Spectator', copilot: 'Copilot' };
  const modeDot = { autopilot: 'bg-success-400', spectator: 'bg-accent-400', copilot: 'bg-warning-400' };

  return (
    <aside className="w-[200px] h-full flex flex-col bg-surface-100/80 border-r border-white/[0.04]">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-400 to-purple-500 flex items-center justify-center shadow-lg shadow-accent-500/15">
          <Zap size={15} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-bold tracking-tight text-white leading-none">
            Free<span className="text-accent-400">Suite</span>
          </span>
          <span className="text-[9px] text-white/25 font-medium tracking-widest uppercase mt-0.5">
            Agent Toolbox
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-white/[0.04] mb-2" />

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 1 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? 'text-white bg-white/[0.06]'
                    : 'text-white/35 hover:text-white/60 hover:bg-white/[0.02]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-accent-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={14} className="shrink-0" />
                <span>{item.label}</span>
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Mode indicator */}
      <div className="mx-3 mb-2 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${modeDot[agentMode]} animate-pulse-dot`} />
          <span className="text-[10px] text-white/30 font-medium">{modeLabel[agentMode]}</span>
        </div>
        <p className="text-[9px] text-white/15 mt-0.5 ml-3.5">
          {tools.length} tools registered
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.03]">
        <span className="text-[10px] text-white/15 font-mono">v0.1.0</span>
      </div>
    </aside>
  );
}
