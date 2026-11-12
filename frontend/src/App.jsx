import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import YayasanPage from './pages/YayasanPage';

// ─── WebGIS Festival Tanam Hulu ───────────────────────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PetaPage from './pages/PetaPage';
import BeritaPage from './pages/BeritaPage';
import ProposalModal from './components/ProposalModal';

// ── Page slide variant ────────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -18 },
};
const pageTransition = { duration: 0.35, ease: 'easeInOut' };

export default function App() {
  const [activePage, setActivePage] = useState('yayasan');
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [selectedLocationMap, setSelectedLocationMap] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const handleSelectLocationMap = (loc) => {
    setSelectedLocationMap(loc);
    setActivePage('peta');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setActivePage('berita');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Yayasan Landing Page ──────────────────────────────────────────────────
  if (activePage === 'yayasan') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="yayasan"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={pageTransition}
        >
          <YayasanPage
            onNavigateTo={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Festival Tanam Hulu WebGIS Shell ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a] flex flex-col justify-between selection:bg-[#2E8068] selection:text-white">

      {/* Back to Yayasan Profile button — with micro-interaction */}
      <div className="fixed bottom-5 left-5 z-[9999]">
        <motion.button
          onClick={() => {
            setActivePage('yayasan');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          whileHover={{ y: -3, scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full shadow-lg"
          style={{ background: '#1B3226', color: '#F7F3E8' }}
        >
          ← Profil Yayasan
        </motion.button>
      </div>

      {/* Header Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenProposal={() => setIsProposalOpen(true)}
      />

      {/* Main Dynamic View — AnimatePresence drives page transitions */}
      <div className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          {activePage === 'home' && (
            <motion.div
              key="home"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <HomePage
                onOpenProposal={() => setIsProposalOpen(true)}
                onNavigateToMap={() => {
                  setActivePage('peta');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToNews={() => {
                  setActivePage('berita');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onSelectLocationMap={handleSelectLocationMap}
                onSelectArticle={handleSelectArticle}
              />
            </motion.div>
          )}

          {activePage === 'peta' && (
            <motion.div
              key="peta"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <PetaPage
                onNavigateHome={() => {
                  setActivePage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                selectedLocation={selectedLocationMap}
              />
            </motion.div>
          )}

          {activePage === 'berita' && (
            <motion.div
              key="berita"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={pageTransition}
            >
              <BeritaPage
                onNavigateHome={() => {
                  setActivePage('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                selectedArticle={selectedArticle}
                setSelectedArticle={setSelectedArticle}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <Footer
        setActivePage={setActivePage}
        onOpenProposal={() => setIsProposalOpen(true)}
      />

      {/* Interactive Proposal Modal */}
      <ProposalModal
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
      />
    </div>
  );
}
