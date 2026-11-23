import React, { useState } from 'react';
import { Sprout, Menu, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar({ activePage, setActivePage, onOpenProposal }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home',   label: 'Beranda' },
    { id: 'peta',   label: 'Peta WebGIS' },
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
            <div className="w-10 h-10 bg-[#F4B91F] rounded flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
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
                  className={`relative px-2 py-2 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-[#F4B91F]'
                      : 'text-white hover:text-[#F4B91F]'
                  }`}
                >
                  {item.label}
                  {/* Animated underline */}
                  <motion.span
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F4B91F] rounded-full"
                    initial={false}
                    animate={{ scaleX: isActive ? 1 : 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    style={{ transformOrigin: 'left' }}
                  />
                </button>
              );
            })}
          </nav>

          {/* CTA & Admin Button */}
          <div className="flex items-center gap-3">
            {/* Team Portal Button */}
            <button
              onClick={() => handleNavClick('tim')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-400/30 text-emerald-100 transition-all duration-200 cursor-pointer"
              title="Portal Khusus 10 Tim Penanam"
            >
              <Sprout className="w-4 h-4 text-[#F4B91F]" />
              <span className="hidden lg:inline">Portal Tim</span>
            </button>

            {/* Admin Portal Button */}
            <button
              onClick={() => handleNavClick('admin')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-white/20 text-[#F4B91F] transition-all duration-200 cursor-pointer"
              title="Panel Khusus Admin & Panitia"
            >
              <ShieldCheck className="w-4 h-4 text-[#F4B91F]" />
              <span className="hidden sm:inline">Panel Admin</span>
            </button>

            {/* Desktop CTA with micro-interaction */}
            <button
              onClick={onOpenProposal}
              className="hidden sm:flex items-center justify-center bg-[#F4B91F] hover:bg-[#e3a918] text-[#063F35] px-5 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-yellow/30 active:scale-95 cursor-pointer"
            >
              Ajukan Proposal
            </button>

            {/* Mobile hamburger toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-[#F4B91F] focus:outline-none transition-colors duration-200"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isMobileMenuOpen ? (
                  <motion.span
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0,   opacity: 1 }}
                    exit={{   rotate:  90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <X className="w-6 h-6" />
                  </motion.span>
                ) : (
                  <motion.span
                    key="open"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0,  opacity: 1 }}
                    exit={{   rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="block"
                  >
                    <Menu className="w-6 h-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden bg-[#063F35] border-t border-white/10"
          >
            <div className="px-4 pt-4 pb-6 space-y-4">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item, idx) => {
                  const isActive = activePage === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.25, ease: 'easeOut' }}
                      onClick={() => handleNavClick(item.id)}
                      className={`text-left px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-white/10 text-[#F4B91F]'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </motion.button>
                  );
                })}

                <motion.button
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.18, duration: 0.25, ease: 'easeOut' }}
                  onClick={() => handleNavClick('tim')}
                  className="flex items-center gap-2 text-left px-4 py-3 text-base font-semibold rounded-lg bg-emerald-900/60 text-emerald-100 border border-emerald-400/30"
                >
                  <Sprout className="w-5 h-5 text-[#F4B91F]" />
                  <span>Portal Tim Penanam</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.25, ease: 'easeOut' }}
                  onClick={() => handleNavClick('admin')}
                  className="flex items-center gap-2 text-left px-4 py-3 text-base font-semibold rounded-lg bg-emerald-950/60 text-[#F4B91F]"
                >
                  <ShieldCheck className="w-5 h-5 text-[#F4B91F]" />
                  <span>Panel Admin</span>
                </motion.button>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.25, ease: 'easeOut' }}
                className="pt-2 px-4"
              >
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenProposal();
                  }}
                  className="w-full bg-[#F4B91F] text-[#063F35] px-5 py-3 rounded-lg font-bold text-sm transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-yellow/30 active:scale-95 cursor-pointer"
                >
                  Ajukan Proposal
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
