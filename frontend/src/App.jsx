import React, { useState } from 'react';
import YayasanPage from './pages/YayasanPage';

// ─── WebGIS Festival Tanam Hulu (existing app) ───────────────────────────────
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PetaPage from './pages/PetaPage';
import BeritaPage from './pages/BeritaPage';
import ProposalModal from './components/ProposalModal';

// ─── App Router ───────────────────────────────────────────────────────────────
// activePage values:
//   'yayasan'  → Profil Yayasan Galapagos Lestari Indonesia (new landing page)
//   'home'     → Festival Tanam Hulu WebGIS home
//   'peta'     → WebGIS map view
//   'berita'   → Berita / news view
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
      <YayasanPage
        onNavigateTo={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  // ── Festival Tanam Hulu WebGIS Shell ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a] flex flex-col justify-between selection:bg-[#2E8068] selection:text-white">

      {/* Back to Yayasan Profile button */}
      <div className="fixed bottom-5 left-5 z-[9999]">
        <button
          onClick={() => {
            setActivePage('yayasan');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105"
          style={{ background: '#1B3226', color: '#F7F3E8' }}
        >
          ← Profil Yayasan
        </button>
      </div>

      {/* Header Navigation */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenProposal={() => setIsProposalOpen(true)}
      />

      {/* Main Dynamic View */}
      <div className="flex-grow">
        {activePage === 'home' && (
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
        )}

        {activePage === 'peta' && (
          <PetaPage
            onNavigateHome={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            selectedLocation={selectedLocationMap}
          />
        )}

        {activePage === 'berita' && (
          <BeritaPage
            onNavigateHome={() => {
              setActivePage('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            selectedArticle={selectedArticle}
            setSelectedArticle={setSelectedArticle}
          />
        )}
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
