import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import PetaPage from './pages/PetaPage';
import BeritaPage from './pages/BeritaPage';
import ProposalModal from './components/ProposalModal';

export default function App() {
  const [activePage, setActivePage] = useState('home'); // 'home' | 'peta' | 'berita'
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

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a] flex flex-col justify-between selection:bg-[#2E8068] selection:text-white">
      
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
