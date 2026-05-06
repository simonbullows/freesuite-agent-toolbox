import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Wrench, Activity, Monitor, Settings,
  Zap, ChevronRight, PanelLeftClose,
} from 'lucide-react';
import { useToolboxStore } from '../stores/toolboxStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Wrench,          label: 'Tools',     path: '/tools' },
  { icon: Activity,        label: 'Activity',  path: '/activity' },
  { icon: Monitor,         label: 'System',    path: '/system' },
  { icon: Settings,        label: 'Settings',  path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const { tools, agentMode } = useToolboxStore();
  const [collapsed, setCollapsed] = useState(false);

  const modeLabel = { autopilot: 'Autopilot', spectator: 'Spectator', copilot: 'Copilot' };
  const modeDot   = { autopilot: 'bg-success-400', spectator: 'bg-accent-400', copilot: 'bg-warning-400' };
  const modeGlow  = { autopilot: 'shadow-success-400/20', spectator: 'shadow-accent-400/20', copilot: 'shadow-warning-400/20' };

  return (
    <motion.aside
      initial={{ width: 220 }}
      animate={{ width: collapsed ? 68 : 220 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="h-full flex flex-col bg-surface-100/60 backdrop-blur-xl border-r border-white/[0.04] relative shrink-0 z-10"
    >
      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -right-3 top-9 w-6 h-6 bg-surface-400 border border-white/[0.08] rounded-full flex items-center justify-center text-white/40 hover:text-white/70 z-50 shadow-lg shadow-black/30 transition-colors"
      >
        {collapsed ? <ChevronRight size={12} /> : <PanelLeftClose size={12} />}
      </motion.button>

      {/* Logo */}
      <div className={`px-4 pt-5 pb-4 flex items-center gap-2.5 ${collapsed ? 'justify-center px-2' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-400 via-purple-500 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/25 shrink-0"
        >
          <Zap size={16} className="text-white drop-shadow-sm" />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-[14px] font-bold tracking-tight text-white leading-none block">
                Free<span className="text-gradient">Suite</span>
              </span>
              <span className="text-[9px] text-white/20 font-semibold tracking-[0.15em] uppercase mt-0.5 block">
                Agent Toolbox
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="mx-4 mb-2">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: collapsed ? 0 : 2 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  relative flex items-center ${collapsed ? 'justify-center' : ''} gap-2.5 px-2.5 py-2.5 rounded-xl text-[12px] font-medium
                  transition-all duration-200 group
                  ${isActive
                    ? 'text-white bg-white/[0.07] shadow-sm shadow-black/10'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/[0.025]'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2.5px] h-5 bg-gradient-to-b from-accent-400 to-accent-500 rounded-r-full shadow-sm shadow-accent-400/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={16} className="shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip for collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-surface-400/95 backdrop-blur-lg text-white text-[11px] font-medium rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-xl shadow-black/30 border border-white/[0.06]">
                    {item.label}
                  </div>
                )}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Mode indicator */}
      <AnimatePresence>
        {!collapsed ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mb-2 px-3 py-2.5 rounded-xl glass-card"
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${modeDot[agentMode]} shadow-md ${modeGlow[agentMode]} animate-pulse-dot`} />
              <span className="text-[11px] text-white/45 font-semibold">{modeLabel[agentMode]}</span>
            </div>
            <p className="text-[9px] text-white/15 mt-1 ml-4">
              {tools.length} tools registered
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mb-2"
          >
            <div className={`w-2.5 h-2.5 rounded-full ${modeDot[agentMode]} shadow-md ${modeGlow[agentMode]} animate-pulse-dot`} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className={`px-4 py-3 border-t border-white/[0.03] ${collapsed ? 'text-center' : ''}`}>
        <span className="text-[9px] text-white/10 font-mono tracking-wide">
          {collapsed ? '0.1' : 'v0.1.0 · freesuite.ai'}
        </span>
      </div>
    </motion.aside>
  );
}
