import React, { useState } from 'react';
import { Sprout, Menu, X } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenProposal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda' },
    { id: 'peta', label: 'Peta WebGIS' },
    { id: 'berita', label: 'Berita & Kabar' },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#063F35] border-b border-white/10 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-[#F4B91F] rounded flex items-center justify-center">
              <Sprout className="w-6 h-6 text-[#063F35]" />
            </div>
            <div>
              <span className="text-lg md:text-xl font-bold tracking-tight text-white block leading-tight">
                Festival Tanam Hulu
              </span>
              <span className="text-sm font-medium text-white/70 block">
                Kota Padang
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-2 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#F4B91F] border-b-2 border-[#F4B91F]'
                      : 'text-white hover:text-[#F4B91F]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* CTA & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenProposal}
              className="hidden sm:flex items-center justify-center bg-[#F4B91F] hover:bg-[#e3a918] text-[#063F35] px-6 py-2.5 rounded-lg font-bold text-sm transition-colors"
            >
              Ajukan Proposal
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#F4B91F] focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#063F35] border-t border-white/10 px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`text-left px-4 py-3 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-white/10 text-[#F4B91F] rounded-lg'
                      : 'text-white hover:bg-white/5 rounded-lg'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
          
          <div className="pt-2 px-4">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenProposal();
              }}
              className="w-full bg-[#F4B91F] text-[#063F35] px-5 py-3 rounded-lg font-bold transition-colors"
            >
              Ajukan Proposal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
