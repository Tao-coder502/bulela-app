import React from 'react';
import { HeaderPill } from './HeaderPill';
import { Sidebar } from './Sidebar';
import BottomNav from './BottomNav';
import { useBulelaStore } from '../store/useBulelaStore';
import { AnimatePresence, motion } from 'motion/react';
import SyncToast from './SyncToast';
import Loader from './Loader';
import TopHUD from './TopHUD';
import UpgradeModal from './UpgradeModal';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onUpgradeClick?: () => void;
}

export const AppLayout: React.FC<Props> = ({ children }) => {
  const { isScreenLoading, activeTab, isPricingOpen, setPricingOpen } = useBulelaStore();

  return (
    <div className="min-h-screen bg-cream font-sans selection:bg-honey/30 selection:text-honey relative">
      {/* Sidebar - Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-[256px] relative min-h-screen flex flex-col">
        {/* Content Container */}
        <div className="flex-1 pb-24 lg:pb-8 px-4 lg:px-8 max-w-4xl mx-auto w-full relative z-10 pt-4">
          <TopHUD />
          <AnimatePresence mode="wait">
            {isScreenLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center min-h-[60vh]"
              >
                <Loader />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <SyncToast />
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Nav - Mobile */}
      <BottomNav />

      {/* Global Modals */}
      <UpgradeModal isOpen={isPricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};
