import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wrench,
  Activity,
  Monitor,
  Settings,
  Zap
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wrench, label: 'Tools', path: '/tools' },
  { icon: Activity, label: 'Activity', path: '/activity' },
  { icon: Monitor, label: 'System', path: '/system' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-[220px] h-full flex flex-col bg-surface-100 border-r border-white/[0.04]">
      {/* Logo */}
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/20">
          <Zap size={18} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold tracking-tight text-white leading-none">
            FreeSuite<span className="text-accent-400">.AI</span>
          </span>
          <span className="text-[10px] text-white/30 font-medium tracking-wider uppercase mt-0.5">
            Agent Toolbox
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? 'text-white bg-white/[0.07]'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-accent-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={16} className="shrink-0" />
                <span>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse-dot" />
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 text-[11px] text-white/20">
          <div className="w-2 h-2 rounded-full bg-success-400 animate-pulse-dot" />
          <span>v0.1.0 · Local</span>
        </div>
      </div>
    </aside>
  );
}
