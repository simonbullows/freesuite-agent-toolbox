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
];

export function Sidebar() {
  const location = useLocation();
  const { tools, agentMode } = useToolboxStore();
  const [collapsed, setCollapsed] = useState(false);

  const modeLabel = { autopilot: 'Autopilot', spectator: 'Spectator', copilot: 'Copilot' };
  const modeDot   = { autopilot: 'bg-green-500', spectator: 'bg-blue-400', copilot: 'bg-amber-400' };

  return (
    <motion.aside
      initial={{ width: 256 }}
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full bg-surface border-r border-surface-highlight pt-6 pb-4 relative transition-colors duration-300"
    >
      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="absolute -right-3 top-9 w-6 h-6 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white z-50 shadow-lg"
      >
        {collapsed ? <ChevronRight size={14} /> : <PanelLeftClose size={14} />}
      </motion.button>

      {/* Logo */}
      <div className={`px-6 mb-8 flex items-center gap-3 ${collapsed ? 'justify-center px-2' : ''}`}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className="w-9 h-9 bg-gradient-to-br from-white to-zinc-300 rounded-xl flex items-center justify-center text-black font-bold text-sm shadow-lg shrink-0"
        >
          FS
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-lg font-bold tracking-tight text-white block">FREESUITE</span>
              <span className="text-[10px] text-zinc-500 font-medium">.AI Agent Toolbox</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3 scrollbar-hide">
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path} className="block relative">
                <motion.div
                  whileHover={{ x: collapsed ? 0 : 4 }}
                  className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-900/70'
                  }`}
                >
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                  <item.icon size={18} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex-1 overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {collapsed && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
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
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 mb-3"
            >
              <div className="text-[10px] font-bold text-zinc-600 tracking-widest uppercase mb-2">Agent Mode</div>
              <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${modeDot[agentMode]} animate-pulse`} />
                  <span className="text-sm font-medium text-zinc-300">{modeLabel[agentMode]}</span>
                </div>
                <p className="text-[11px] text-zinc-600 mt-1 ml-4.5">
                  {tools.length} tools registered
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom — Settings */}
      <div className="mt-auto px-3 pt-4 border-t border-zinc-900/50 space-y-1">
        <NavLink to="/settings" className="block">
          {({ isActive }) => (
            <motion.div
              whileHover={{ x: collapsed ? 0 : 4 }}
              className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} gap-3 px-3 py-2.5 w-full text-left rounded-xl text-sm font-medium transition-colors group relative ${
                isActive
                  ? 'text-white bg-zinc-900/50'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
              }`}
            >
              <Settings size={18} className="shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span className="overflow-hidden whitespace-nowrap">Settings</motion.span>
                )}
              </AnimatePresence>
              {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                  Settings
                </div>
              )}
            </motion.div>
          )}
        </NavLink>
        <div className={`px-3 py-2 text-xs text-zinc-600 text-center`}>
          <p>FREESUITE v0.1.0</p>
        </div>
      </div>
    </motion.aside>
  );
}
