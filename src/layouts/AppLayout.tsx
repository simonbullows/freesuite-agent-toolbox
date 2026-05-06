import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from '../components/Sidebar';
import { TopBar } from '../components/TopBar';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.12 } },
};

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-white font-sans selection:bg-blue-500/30 transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
