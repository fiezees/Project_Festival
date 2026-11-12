'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Trees, ArrowUpRight, Menu, X, ChevronRight, ChevronLeft,
  Leaf, Mountain, Heart, Users, Shield, BookOpen,
  Mail, Phone, Globe, Star, Sprout, User,
} from 'lucide-react';
import galapagosLogo from '../assets/logo-galapagos.png';

// ── Custom brand SVG icons (not in lucide-react v1.48) ────────────────────────
const InstagramIcon = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const FacebookIcon = ({ size = 16, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bgCream : '#F7F3E8',
  bgDark  : '#EDE6D6',
  yellow  : '#E5A93C',
  yellowH : '#D49424',
  forest  : '#1B3226',
  sage    : '#5C7457',
  brown   : '#4A443B',
};

// ── Smooth-scroll helper (offset for sticky navbar) ───────────────────────────
function goTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 110, behavior: 'smooth' });
}

// ── Fade-in on viewport enter ─────────────────────────────────────────────────
function FadeIn({ children, delay = 0, dir = 'up', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-70px' });
  const hidden = {
    opacity: 0,
    y: dir === 'up' ? 36 : dir === 'down' ? -36 : 0,
    x: dir === 'left' ? 36 : dir === 'right' ? -36 : 0,
  };
  return (
    <motion.div ref={ref} className={className}
      initial={hidden}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : hidden}
      transition={{ type: 'spring', stiffness: 55, damping: 18, delay }}>
      {children}
    </motion.div>
  );
}

// ── Topography background pattern ─────────────────────────────────────────────
function Topo({ opacity = 0.06, color = '#1B3226', id = 'tp0' }) {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }}>
      <defs>
        <pattern id={id} x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
          <path d="M0 60 Q15 40 30 60 Q45 80 60 60 Q75 40 90 60 Q105 80 120 60"
            fill="none" stroke={color} strokeWidth="1.2" />
          <path d="M0 90 Q15 70 30 90 Q45 110 60 90 Q75 70 90 90 Q105 110 120 90"
            fill="none" stroke={color} strokeWidth="1.2" />
          <path d="M0 30 Q15 10 30 30 Q45 50 60 30 Q75 10 90 30 Q105 50 120 30"
            fill="none" stroke={color} strokeWidth="1.2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NAVBAR — links in page-order, active-section dot
// ═══════════════════════════════════════════════════════════════════════════════
function Navbar({ onNavigateTo }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  // Links ordered exactly as the sections appear on the page ↓
  const navLinks = [
    { label: 'Cerita Kami',      id: 'cerita' },
    { label: 'Ruang Gerak',      id: 'ruang-gerak' },
    { label: 'Jejak Dampak',     id: 'dampak' },
    { label: 'Kawan Galapagos',  id: 'komunitas' },
    { label: 'Kabar Alam',       id: 'kabar' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Intersection Observer → highlight active section in navbar
  useEffect(() => {
    const els = navLinks.map(l => document.getElementById(l.id)).filter(Boolean);
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id); }),
      { threshold: 0.25, rootMargin: '-100px 0px -40% 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handleNav = (id) => { setMenuOpen(false); goTo(id); };

  return (
    <div className="fixed top-5 inset-x-0 mx-auto max-w-6xl z-50 px-4">
      <motion.nav
        initial={{ opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className="flex items-center justify-between rounded-full px-5 py-3 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(247,243,232,0.95)' : 'rgba(247,243,232,0.82)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(27,50,38,0.11)',
          boxShadow: scrolled ? '0 6px 28px rgba(27,50,38,0.11)' : '0 2px 8px rgba(27,50,38,0.06)',
        }}>
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={galapagosLogo} alt="Logo Galapagos" className="w-7 h-7 rounded-full object-contain shrink-0 shadow-sm" />
          <span className="text-xl font-black tracking-tight" style={{ color: C.forest }}>
            Galapagos<span style={{ color: C.yellow }}>.</span>
          </span>
          <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
            style={{ color: C.sage, borderColor: `${C.sage}40`, background: `${C.sage}15` }}>
            Est. 1986
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {navLinks.map(link => {
            const active = activeId === link.id;
            return (
              <button key={link.id} onClick={() => handleNav(link.id)}
                className="relative text-sm font-medium px-3 py-1.5 rounded-full transition-all"
                style={{ color: active ? C.forest : C.brown, background: active ? `${C.yellow}22` : 'transparent' }}>
                {link.label}
                {active && (
                  <motion.span layoutId="navdot"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: C.yellow }} />
                )}
              </button>
            );
          })}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onNavigateTo('peta')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="hidden sm:flex items-center gap-2 text-sm font-black px-4 py-2 rounded-full"
            style={{ background: C.yellow, color: C.forest }}>
            <Trees size={14} />
            <span>Peta Tanam Hulu</span>
            <ArrowUpRight size={13} />
          </motion.button>
          <button className="md:hidden p-2 rounded-full" style={{ color: C.forest }}
            onClick={() => setMenuOpen(v => !v)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="mt-2 mx-2 rounded-3xl p-4"
            style={{ background: 'rgba(247,243,232,0.97)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(27,50,38,0.10)', boxShadow: '0 20px 40px rgba(27,50,38,0.12)' }}>
            {navLinks.map((link, i) => (
              <motion.button key={link.id}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleNav(link.id)}
                className="flex items-center justify-between w-full px-3 py-3 rounded-2xl hover:bg-black/5 transition-colors"
                style={{ color: C.forest }}>
                <span className="font-medium">{link.label}</span>
                <ChevronRight size={16} style={{ color: C.sage }} />
              </motion.button>
            ))}
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(27,50,38,0.08)' }}>
              <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => { setMenuOpen(false); onNavigateTo('peta'); }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-bold text-sm"
                style={{ background: C.yellow, color: C.forest }}>
                <Trees size={15} /> Peta Festival Tanam Hulu <ArrowUpRight size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection({ onNavigateTo }) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-32 pb-20"
      style={{ background: C.bgCream }}>
      <Topo opacity={0.07} id="tp-hero" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">

          {/* ── Left: text 7 cols ── */}
          <div className="lg:col-span-7 space-y-6">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background: `${C.sage}18`, color: C.forest, border: `1px solid ${C.sage}30` }}>
                🌱 Dari Ranah Minang untuk Bumi Sejak 1986
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
                style={{ color: C.forest }}>
                Halo! Kami<br />
                Yayasan{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">Galapagos.</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M4 8 Q50 2 100 7 Q150 12 196 5"
                      stroke={C.yellow} strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="text-lg leading-relaxed max-w-xl" style={{ color: C.brown }}>
                Berawal dari sekumpulan kawan pecinta alam di Padang yang hobi mendaki gunung, kini kami bergerak
                bersama warga menjaga hutan hulu sungai, merawat lingkungan, dan bersiaga menghadapi bencana.
              </p>
            </FadeIn>

            <FadeIn delay={0.4}>
              <div className="flex flex-wrap gap-3 pt-2">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => goTo('cerita')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-base"
                  style={{ background: C.forest, color: C.bgCream }}>
                  Kenali Cerita Kami <ChevronRight size={18} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => onNavigateTo('peta')}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-base"
                  style={{ background: C.yellow, color: C.forest }}>
                  Jelajahi WebGIS Tanam Hulu <ArrowUpRight size={18} />
                </motion.button>
              </div>
            </FadeIn>

            <FadeIn delay={0.5}>
              <div className="flex flex-wrap gap-6 pt-4">
                {[['38+','Tahun Berdiri'],['60K+','Pohon Ditanam'],['500+','Kawan Relawan']].map(([v,l]) => (
                  <div key={l} className="flex flex-col">
                    <span className="text-2xl font-black" style={{ color: C.yellow }}>{v}</span>
                    <span className="text-xs font-medium" style={{ color: C.brown }}>{l}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* ── Right: visual collage 5 cols ── */}
          <div className="lg:col-span-5 relative">
            <FadeIn delay={0.3} dir="left">
              <div className="relative">
                {/* Main portrait image */}
                <motion.div whileHover={{ scale: 1.015 }} transition={{ duration: 0.5 }}
                  className="relative overflow-hidden shadow-2xl"
                  style={{ borderRadius: '2.5rem', border: '5px solid #ffffff' }}>
                  <div className="overflow-hidden" style={{ borderRadius: '2.25rem', aspectRatio: '4/5' }}>
                    <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.7 }}
                      src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80"
                      alt="Hutan Sumatera Barat" className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80'; }} />
                  </div>
                  <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'linear-gradient(to top, rgba(27,50,38,0.55) 0%, rgba(27,50,38,0.05) 50%, transparent 100%)',
                    borderRadius: '2.25rem',
                  }} />
                </motion.div>

                {/* Rotating heritage seal badge with official Galapagos logo */}
                <div className="absolute -top-7 -right-7 z-20">
                  <div className="relative w-36 h-36 rounded-full shadow-2xl flex items-center justify-center cursor-default select-none group"
                    style={{ background: C.bgCream, border: `2.5px solid ${C.forest}` }}>
                    
                    {/* Subtle dashed vintage border */}
                    <div className="absolute inset-2 rounded-full pointer-events-none"
                      style={{ border: `1.5px dashed ${C.forest}30` }} />

                    {/* Rotating text ring */}
                    <motion.div animate={{ rotate: 360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-full h-full pointer-events-none">
                      <svg viewBox="0 0 144 144" className="w-full h-full">
                        <defs>
                          <path id="hero-seal-path"
                            d="M 72, 72 m -54, 0 a 54, 54 0 1, 1 108, 0 a 54, 54 0 1, 1 -108, 0"
                            fill="none" />
                        </defs>
                        <text style={{ fill: C.forest, fontSize: '9px', fontWeight: '900', letterSpacing: '0.18em' }}>
                          <textPath href="#hero-seal-path" startOffset="0%">
                            ✦ YAYASAN GALAPAGOS ✦ PADANG 1986 
                          </textPath>
                        </text>
                      </svg>
                    </motion.div>

                    {/* Official Galapagos Logo in center medallion */}
                    <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden shadow-md flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                      style={{ border: `2px solid ${C.forest}` }}>
                      <img
                        src={galapagosLogo}
                        alt="Logo Yayasan Galapagos"
                        className="w-full h-full object-contain rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Polaroid photo thumbnail (top-left) */}
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, type: 'spring' }}
                  whileHover={{ rotate: 0, scale: 1.08 }}
                  className="absolute top-6 -left-7 z-20 p-2 pb-5 bg-white shadow-2xl cursor-pointer"
                  style={{
                    borderRadius: '1.25rem',
                    border: '2px solid rgba(27,50,38,0.12)',
                    rotate: '-6deg',
                    width: '124px',
                    transition: 'rotate 0.3s ease, transform 0.3s ease',
                  }}>
                  {/* Retro washi tape */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-3 rounded-sm opacity-90 shadow-sm"
                    style={{ background: C.yellow, transform: 'translateX(-50%) rotate(2deg)' }} />

                  <div className="overflow-hidden rounded-lg aspect-square">
                    <img
                      src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=260&q=80"
                      alt="Basecamp Pecinta Alam" className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=260&q=80'; }} />
                  </div>
                  <p className="mt-2 text-center text-[10px] font-black tracking-wide leading-tight" style={{ color: C.forest }}>
                    🏕️ Basecamp '86
                  </p>
                </motion.div>

                {/* Floating quote card (bottom-left) */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, type: 'spring' }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="absolute -bottom-6 -left-6 z-20 max-w-[250px] p-4 rounded-3xl shadow-2xl"
                  style={{
                    background: 'rgba(247,243,232,0.97)',
                    backdropFilter: 'blur(16px)',
                    border: `2px solid rgba(27,50,38,0.15)`,
                  }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: `${C.sage}22`, border: `1px solid ${C.sage}40` }}>
                      <Leaf size={12} style={{ color: C.sage }} />
                    </span>
                    <span className="text-[10px] font-black tracking-wider uppercase" style={{ color: C.sage }}>
                      Prinsip Galapagos
                    </span>
                  </div>
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: C.forest }}>
                    "Menjaga alam bukan tugas pemerintah saja — ini urusan kita bersama."
                  </p>
                  <div className="mt-2.5 pt-2 flex items-center justify-between"
                    style={{ borderTop: '1px solid rgba(27,50,38,0.08)' }}>
                    <span className="text-[10px] font-black" style={{ color: C.brown }}>
                      Romelson Candra
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: `${C.yellow}30`, color: C.forest }}>
                      Ketua
                    </span>
                  </div>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARQUEE BANNER
// ═══════════════════════════════════════════════════════════════════════════════
function MarqueeBanner() {
  const text = '✦ SALAM LESTARI ✦ MENJAGA HULU MERAWAT HILIR ✦ YAYASAN GALAPAGOS LESTARI INDONESIA ✦ BERGERAK BERSAMA KAWAN ✦ SEJAK 31 AGUSTUS 1986 ';
  const rep = text.repeat(4);
  return (
    <div className="relative overflow-hidden py-4 -rotate-1 scale-105 my-10"
      style={{ background: C.yellow, borderTop: `2px solid ${C.forest}`, borderBottom: `2px solid ${C.forest}` }}>
      <motion.div animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        className="flex whitespace-nowrap">
        <span className="text-sm font-black tracking-wide px-4" style={{ color: C.forest }}>{rep}</span>
        <span className="text-sm font-black tracking-wide px-4" style={{ color: C.forest }}>{rep}</span>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BENTO EXPLORER — asymmetric 2×2 grid, no empty cells
// ═══════════════════════════════════════════════════════════════════════════════
function BentoExplorer({ onNavigateTo }) {
  const [hovered, setHovered] = useState(null);

  // Shared card renderer
  const BentoCard = ({ id, sign, desc, img, fallback, action, className = '', style = {} }) => (
    <motion.div
      className={`relative overflow-hidden rounded-3xl cursor-pointer ${className}`}
      style={style}
      onHoverStart={() => setHovered(id)}
      onHoverEnd={() => setHovered(null)}
      onClick={action}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
      {/* Background photo with zoom */}
      <motion.img src={img} alt={sign}
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ scale: hovered === id ? 1.07 : 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        onError={e => { e.currentTarget.src = fallback; }} />
      {/* Gradient */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top,rgba(27,50,38,0.78) 0%,rgba(27,50,38,0.12) 55%,transparent 100%)' }} />
      {/* Papan penunjuk */}
      <div className="absolute top-4 left-4">
        <motion.div
          animate={{ rotate: hovered === id ? 0 : -2, scale: hovered === id ? 1.06 : 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="inline-flex items-center px-3 py-1.5 shadow-lg"
          style={{ background: C.forest, color: C.bgCream, borderRadius: '6px',
            border: '1.5px solid rgba(255,255,255,0.18)' }}>
          <span className="text-[11px] font-black tracking-widest uppercase">{sign}</span>
        </motion.div>
      </div>
      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <AnimatePresence>
          {hovered === id && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="text-sm mb-3 leading-snug" style={{ color: 'rgba(247,243,232,0.92)' }}>
              {desc}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold opacity-70" style={{ color: C.bgCream }}>Kunjungi →</span>
          <motion.div
            animate={{ x: hovered === id ? 4 : 0, y: hovered === id ? -4 : 0 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: hovered === id ? C.yellow : 'rgba(247,243,232,0.2)' }}>
            <ArrowUpRight size={14} style={{ color: hovered === id ? C.forest : C.bgCream }} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section className="py-16 relative" style={{ background: C.bgCream }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-3"
              style={{ background: `${C.sage}18`, color: C.forest, border: `1px solid ${C.sage}30` }}>
              🏕️ Jelajahi Pos Galapagos
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.forest }}>
              Mau Mampir ke Pos Mana Hari Ini?
            </h2>
            <p className="mt-2 text-sm max-w-sm mx-auto" style={{ color: C.brown }}>
              Klik kartu foto untuk menuju setiap bagian perjalanan kami.
            </p>
          </div>
        </FadeIn>

        {/* ── Asymmetric bento: POS 1 tall-left, POS 2+3 stacked-right ── */}
        <FadeIn delay={0.1}>
          {/* Row height: 2 × 18rem = 36rem total */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 mb-4"
            style={{ gridTemplateRows: '18rem 18rem' }}>

            {/* POS 1 — spans 2 cols × 2 rows (tall card) */}
            <BentoCard id="c1"
              sign="POS 1: CERITA DARI 1986"
              desc="Perjalanan dari kaki gunung hingga jadi keluarga besar pecinta alam Sumatera Barat."
              img="https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80"
              fallback="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80"
              action={() => goTo('cerita')}
              className="col-span-2 row-span-2"
            />

            {/* POS 2 — 1 col × 1 row (top right) */}
            <BentoCard id="c2"
              sign="POS 2: RUANG GERAK"
              desc="Konservasi, mitigasi bencana, dan edukasi — tiga pilar aksi kami di lapangan."
              img="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80"
              fallback="https://images.unsplash.com/photo-1534361960057-19f4434a327d?w=600&q=80"
              action={() => goTo('ruang-gerak')}
              className="col-span-1 row-span-1"
            />

            {/* POS 3 — 1 col × 1 row (bottom right) */}
            <BentoCard id="c3"
              sign="POS 3: KAWAN KELUARGA"
              desc="500+ relawan dan warga yang bergerak bersama demi alam Sumatera Barat."
              img="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80"
              fallback="https://images.unsplash.com/photo-1540638349517-3abd5afc5847?w=600&q=80"
              action={() => goTo('komunitas')}
              className="col-span-1 row-span-1"
            />
          </div>

          {/* Mobile: stacked single column */}
          <div className="md:hidden flex flex-col gap-4 mb-4">
            {[
              { id:'c1', sign:'POS 1: CERITA DARI 1986', desc:'Perjalanan dari kaki gunung hingga jadi keluarga besar pecinta alam Sumatera Barat.', img:'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80', fallback:'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80', action:()=>goTo('cerita') },
              { id:'c2', sign:'POS 2: RUANG GERAK', desc:'Tiga pilar aksi kami di lapangan.', img:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80', fallback:'https://images.unsplash.com/photo-1534361960057-19f4434a327d?w=600&q=80', action:()=>goTo('ruang-gerak') },
              { id:'c3', sign:'POS 3: KAWAN KELUARGA', desc:'500+ relawan bergerak bersama.', img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', fallback:'https://images.unsplash.com/photo-1540638349517-3abd5afc5847?w=600&q=80', action:()=>goTo('komunitas') },
            ].map(c => <BentoCard key={c.id} {...c} style={{ height: '14rem' }} />)}
          </div>
        </FadeIn>

        {/* Bottom: Full-width mustard CTA card */}
        <FadeIn delay={0.2}>
          <motion.div
            className="relative overflow-hidden rounded-3xl cursor-pointer"
            style={{ height: '7rem', background: C.yellow }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onHoverStart={() => setHovered('webgis')}
            onHoverEnd={() => setHovered(null)}
            onClick={() => onNavigateTo('peta')}>

            {/* Subtle topo pattern */}
            <div className="absolute inset-0 opacity-10">
              <Topo opacity={1} color={C.forest} id="tp-bento" />
            </div>

            {/* Decorative circle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-15"
              style={{ background: C.forest, transform: 'translate(20%,-50%)' }} />

            <div className="relative z-10 h-full flex items-center justify-between px-8">
              <div>
                {/* Papan penunjuk mustard special */}
                <motion.div
                  animate={{ rotate: hovered === 'webgis' ? 0 : -1, scale: hovered === 'webgis' ? 1.04 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 mb-2 shadow"
                  style={{ background: C.forest, borderRadius: '6px' }}>
                  <Trees size={13} style={{ color: C.yellow }} />
                  <span className="text-[11px] font-black tracking-widest uppercase"
                    style={{ color: C.yellow }}>
                    EKSPLORASI SPESIAL: PETA 60.000 POHON ↗
                  </span>
                </motion.div>
                <p className="text-sm font-semibold opacity-80" style={{ color: C.forest }}>
                  Jelajahi WebGIS interaktif Festival Tanam Hulu — titik penanaman & data DAS Batang Kuranji.
                </p>
              </div>
              <motion.div
                animate={{ x: hovered === 'webgis' ? 5 : 0, y: hovered === 'webgis' ? -5 : 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="hidden sm:flex w-12 h-12 rounded-full items-center justify-center shrink-0 ml-6"
                style={{ background: C.forest }}>
                <ArrowUpRight size={20} style={{ color: C.yellow }} />
              </motion.div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORY SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function StorySection() {
  const milestones = [
    {
      year: '1986', phase: 'Langkah Pertama di Kaki Gunung',
      desc: 'Lahir dari semangat persaudaraan dan cinta alam para siswa pecinta alam (Sispala) di SMA 1 Padang. Pada 31 Agustus 1986, KPA Galapagos resmi berdiri — nama yang terinspirasi dari kepulauan purba yang penuh keanekaragaman hayati.',
      icon: Mountain, color: C.sage,
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80',
      rotate: '2deg',
    },
    {
      year: '2000-an', phase: 'Hadir Saat Bencana Menyapa',
      desc: 'Sumatera Barat dilanda berbagai bencana. Galapagos tak hanya mendaki gunung — mereka turun ke lapangan untuk evakuasi, pemulihan, dan edukasi mitigasi bencana bagi masyarakat yang membutuhkan.',
      icon: Shield, color: '#C0392B',
      img: 'https://images.unsplash.com/photo-1587302912306-cf1ed9c33146?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1534361960057-19f4434a327d?w=400&q=80',
      rotate: '-2deg',
    },
    {
      year: 'Kini', phase: 'Menjaga Hulu & Masa Depan',
      desc: 'Bertransformasi menjadi Yayasan Galapagos Lestari Indonesia, kini bersinergi dengan masyarakat, pemerintah, dan kaum muda dalam rehabilitasi hutan, pembinaan Siswa Tanggap Bencana, dan pelestarian DAS Batang Kuranji.',
      icon: Sprout, color: C.forest,
      img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1573489235842-05dddb86e5f7?w=400&q=80',
      rotate: '1.5deg',
    },
  ];

  return (
    <section id="cerita" className="scroll-mt-28 py-24 relative overflow-hidden" style={{ background: C.bgDark }}>
      <Topo opacity={0.05} color={C.sage} id="tp-story" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: `${C.yellow}25`, color: C.forest, border: `1px solid ${C.yellow}40` }}>
              📖 Jurnal Perjalanan
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: C.forest }}>
              Dari Gunung ke Desa,<br />
              <span style={{ color: C.sage }}>Cerita Kami Panjang.</span>
            </h2>
            <p className="mt-4 text-base max-w-xl mx-auto leading-relaxed" style={{ color: C.brown }}>
              Bukan sekadar organisasi. Ini adalah keluarga besar yang tumbuh bersama alam Sumatera Barat selama lebih dari tiga dekade.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-16">
          {milestones.map((m, i) => {
            const Icon = m.icon;
            const isEven = i % 2 === 0;
            return (
              <FadeIn key={m.year} delay={i * 0.15} dir={isEven ? 'right' : 'left'}>
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: `${m.color}20`, border: `2px solid ${m.color}40` }}>
                        <Icon size={18} style={{ color: m.color }} />
                      </div>
                      <span className="text-xs font-black px-3 py-1 rounded-full"
                        style={{ background: m.color, color: '#fff', letterSpacing: '0.08em' }}>{m.year}</span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: C.forest }}>{m.phase}</h3>
                    <p className="text-base leading-relaxed" style={{ color: C.brown }}>{m.desc}</p>
                  </div>
                  <div className="flex-1 max-w-sm">
                    <motion.div
                      initial={{ rotate: m.rotate }}
                      whileHover={{ rotate: '0deg', scale: 1.03 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="p-3 pb-10 shadow-lg cursor-pointer"
                      style={{ background: '#fff', borderRadius: '1rem',
                        boxShadow: '0 10px 40px rgba(27,50,38,0.15)', rotate: m.rotate }}>
                      <div className="overflow-hidden rounded-xl" style={{ aspectRatio: '4/3' }}>
                        <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.7 }}
                          src={m.img} alt={m.phase} className="w-full h-full object-cover"
                          onError={e => { e.currentTarget.src = m.fallback; }} />
                      </div>
                      <p className="mt-3 text-center text-xs font-semibold tracking-wide" style={{ color: C.brown }}>
                        {m.year} — {m.phase}
                      </p>
                    </motion.div>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPACT SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ImpactSection() {
  const stats = [
    { value: '38+',     unit: 'Tahun',   desc: 'Mengabdi & Menjaga Alam (Sejak 1986)', icon: Star },
    { value: '60.000+', unit: 'Pohon',   desc: 'Ditanam di Kawasan Hulu DAS',          icon: Trees },
    { value: '500+',    unit: 'Orang',   desc: 'Kawan Relawan & Siswa Tanggap Bencana',icon: Users },
    { value: 'Puluhan', unit: 'Nagari',  desc: 'Komunitas Lokal Diberdayakan',          icon: Heart },
  ];
  return (
    <section id="dampak" className="scroll-mt-28 py-24 px-4 sm:px-6" style={{ background: C.bgCream }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="relative overflow-hidden p-10 md:p-16"
            style={{ background: C.forest, borderRadius: '2.5rem' }}>
            <Topo opacity={0.08} color={C.yellow} id="tp-impact" />
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
                  style={{ background: `${C.yellow}25`, color: C.yellow, border: `1px solid ${C.yellow}30` }}>
                  📍 Jejak Langkah Kami
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.bgCream }}>
                  Angka-Angka yang<br /><span style={{ color: C.yellow }}>Bercerita Nyata.</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <FadeIn key={s.unit} delay={i * 0.12}>
                      <motion.div whileHover={{ scale: 1.04, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        className="p-6 rounded-3xl"
                        style={{ background: 'rgba(247,243,232,0.06)', border: '1px solid rgba(247,243,232,0.12)' }}>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                          style={{ background: `${C.yellow}20` }}>
                          <Icon size={20} style={{ color: C.yellow }} />
                        </div>
                        <div className="text-3xl font-black" style={{ color: C.yellow }}>{s.value}</div>
                        <div className="text-base font-bold mt-0.5" style={{ color: C.bgCream }}>{s.unit}</div>
                        <p className="text-sm mt-2 leading-snug opacity-70" style={{ color: C.bgCream }}>{s.desc}</p>
                      </motion.div>
                    </FadeIn>
                  );
                })}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRAMS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function ProgramsSection({ onNavigateTo }) {
  const programs = [
    { icon: Trees,    emoji: '🌳', title: 'Konservasi & Rehabilitasi Hutan',
      desc: 'Pemulihan ekosistem hulu sungai seperti DAS Batang Kuranji, penghijauan lahan kritis, dan pemantauan pohon berkelanjutan bersama masyarakat lokal.',
      hasWebGIS: true, color: C.sage },
    { icon: Shield,   emoji: '🛡️', title: 'Mitigasi & Tanggap Darurat Bencana',
      desc: 'Pelatihan kesiapsiagaan bencana, tim reaksi cepat kemanusiaan, dan pemetaan kawasan rawan bencana di Sumatera Barat untuk masyarakat yang lebih tangguh.',
      hasWebGIS: false, color: '#C0392B' },
    { icon: BookOpen, emoji: '📚', title: 'Edukasi & Siswa Tanggap Bencana',
      desc: 'Membina generasi muda dan pelajar di Kota Padang agar mencintai alam sekaligus memiliki keterampilan tanggap bencana sejak dini.',
      hasWebGIS: false, color: C.yellow },
  ];
  return (
    <section id="ruang-gerak" className="scroll-mt-28 py-24 relative overflow-hidden" style={{ background: C.bgDark }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: `${C.sage}18`, color: C.forest, border: `1px solid ${C.sage}30` }}>
              🌿 Ruang Gerak
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: C.forest }}>
              Di Mana Kami Bergerak?
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: C.brown }}>
              Tiga pilar utama yang menopang setiap langkah Yayasan Galapagos Lestari Indonesia di lapangan.
            </p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((prog, i) => {
            const Icon = prog.icon;
            return (
              <FadeIn key={prog.title} delay={i * 0.12}>
                <motion.div whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="relative p-6 rounded-3xl cursor-pointer group"
                  style={{ background: C.bgCream, border: '1px solid rgba(27,50,38,0.08)' }}>
                  <div className="text-4xl mb-4">{prog.emoji}</div>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${prog.color}18`, border: `1px solid ${prog.color}30` }}>
                    <Icon size={20} style={{ color: prog.color }} />
                  </div>
                  <h3 className="text-lg font-black mb-3 tracking-tight" style={{ color: C.forest }}>{prog.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.brown }}>{prog.desc}</p>
                  {prog.hasWebGIS && (
                    <motion.button whileHover={{ x: 3 }} onClick={() => onNavigateTo('peta')}
                      className="mt-4 flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-full"
                      style={{ color: C.forest, background: `${C.yellow}30`, border: `1px solid ${C.yellow}50` }}>
                      <MapPin size={12} /> Lihat di Peta WebGIS <ArrowUpRight size={12} />
                    </motion.button>
                  )}
                  <div className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: C.yellow }}>
                    <ChevronRight size={14} style={{ color: C.forest }} />
                  </div>
                </motion.div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMUNITY SECTION — Tuku-style horizontal portrait slider (fixed bubble)
// ═══════════════════════════════════════════════════════════════════════════════
function CommunitySection() {
  const [activeIdx, setActiveIdx] = useState(null);
  const sliderRef  = useRef(null);
  const isDragging = useRef(false);
  const startX     = useRef(0);
  const startScroll= useRef(0);

  const members = [
    { name: 'Romelson Candra',      role: 'Ketua Yayasan',                 quote: 'Menjaga alam adalah bentuk syukur kita atas karunia Tuhan yang paling nyata.',       color: C.yellow },
    { name: 'Tim Tanggap Bencana',  role: 'Koordinator Lapangan',          quote: 'Siap sedia sebelum bencana datang — itulah prinsip kami di setiap latihan.',        color: C.sage },
    { name: 'Petani Hutan Kuranji', role: 'Mitra Hulu DAS',                quote: 'Bersama Galapagos, lahan kritis di hulu kami kini mulai menghijau kembali.',        color: '#8B6F47' },
    { name: 'Relawan Sispala',      role: 'Pelajar Pecinta Alam',          quote: 'Di sini kami belajar bahwa mendaki gunung berarti mencintai bumi lebih dalam.',      color: '#5D8AA8' },
    { name: 'Tim Pemetaan WebGIS',  role: 'Teknologi Konservasi',          quote: 'Data pohon yang kami petakan adalah bukti nyata setiap tetes keringat di lapangan.', color: C.forest },
    { name: 'Warga Nagari Matur',   role: 'Mitra Komunitas Lokal',         quote: 'Dulu kami tak tahu cara merawat hutan. Kini kami jadi penjaganya bersama.',         color: '#B86B43' },
    { name: 'Fasilitator Edukasi',  role: 'Pembina Siswa Tanggap Bencana', quote: 'Anak yang belajar mencintai alam hari ini adalah penjaga bumi di masa depan.',     color: '#C0392B' },
  ];

  const CARD_W = 200; // px
  const GAP    = 20;  // px

  const scrollByN = (dir) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dir * (CARD_W + GAP) * 2, behavior: 'smooth' });
  };

  const onMouseDown = e => { isDragging.current = true; startX.current = e.clientX; startScroll.current = sliderRef.current.scrollLeft; };
  const onMouseMove = e => { if (!isDragging.current) return; sliderRef.current.scrollLeft = startScroll.current - (e.clientX - startX.current); };
  const onMouseUp   = () => { isDragging.current = false; };

  return (
    <section id="komunitas" className="scroll-mt-28" style={{ background: C.forest }}>
      {/* Curved top from previous section */}
      <div style={{ background: C.bgDark }}>
        <div style={{ background: C.forest, borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem', height: '4rem' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-4">
          <FadeIn>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-3"
                style={{ background: `${C.yellow}22`, color: C.yellow, border: `1px solid ${C.yellow}35` }}>
                🤝 Kawan Galapagos
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight italic"
                style={{ color: C.bgCream }}>
                BERAWAL DARI SISPALA,<br />
                <span style={{ color: C.yellow }}>BERAKHIR JADI KELUARGA</span>
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="flex flex-col items-end gap-3">
              <p className="text-xs font-semibold tracking-widest opacity-50 text-right" style={{ color: C.bgCream }}>
                « GESER UNTUK LIHAT LAINNYA »
              </p>
              <div className="flex items-center gap-2">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => scrollByN(-1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(247,243,232,0.12)', color: C.bgCream }}>
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={() => scrollByN(1)}
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: C.yellow, color: C.forest }}>
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── Portrait Slider ── */}
        <div ref={sliderRef}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove}
          onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{ overflowX: 'auto', overflowY: 'visible', scrollbarWidth: 'none', cursor: 'grab',
            position: 'relative' }}>
          {/* Inner flex row */}
          <div className="flex select-none pt-4 pb-6"
            style={{ gap: `${GAP}px`, width: 'max-content', scrollSnapType: 'x mandatory' }}>

            {members.map((m, i) => (
              /* Outer wrapper */
              <div key={m.name}
                className="relative shrink-0 flex flex-col items-center"
                style={{ width: `${CARD_W}px`, scrollSnapAlign: 'start' }}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => setActiveIdx(activeIdx === i ? null : i)}>

                {/* ── Portrait card — lifts on hover ── */}
                <motion.div className="relative w-full cursor-pointer"
                  animate={{ y: activeIdx === i ? -8 : 0, scale: activeIdx === i ? 1.02 : 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}>

                  {/* White-border frame */}
                  <div className="w-full rounded-2xl overflow-hidden"
                    style={{
                      border: '5px solid #ffffff',
                      boxShadow: activeIdx === i
                        ? `0 20px 50px rgba(0,0,0,0.45), 0 0 0 3px ${m.color}`
                        : '0 10px 32px rgba(0,0,0,0.30)',
                      background: '#f0ede6',
                      aspectRatio: '3/4',
                      transition: 'box-shadow 0.3s ease',
                    }}>
                    {/* Profile silhouette — clean, no SVG drawing characters */}
                    <div className="w-full h-full flex flex-col items-center justify-center"
                      style={{ background: `linear-gradient(160deg,${m.color}28 0%,${m.color}0A 100%)` }}>
                      <div className="rounded-full mb-3 flex items-center justify-center"
                        style={{ width: 80, height: 80, background: `${m.color}28`,
                          border: `3px solid ${m.color}55`, transition: 'all 0.3s' }}>
                        <User size={40} style={{ color: `${m.color}AA` }} />
                      </div>
                      <span className="text-sm font-black tracking-wider" style={{ color: `${m.color}70` }}>
                        {m.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Accent dot */}
                  <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full border-2 border-white"
                    style={{ background: m.color }} />
                </motion.div>

                {/* ── Name label — always visible, slightly tilted, straightens on hover ── */}
                <motion.div
                  animate={{ rotate: activeIdx === i ? 0 : -1.5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="mt-3 px-4 py-2 text-center shadow-md"
                  style={{ background: C.bgCream, borderRadius: '8px', minWidth: '150px',
                    border: activeIdx === i ? `2px solid ${m.color}60` : '2px solid transparent',
                    transition: 'border-color 0.25s' }}>
                  <p className="text-xs font-black leading-tight" style={{ color: C.forest }}>{m.name}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: m.color }}>{m.role}</p>
                </motion.div>
              </div>
            ))}
          </div>
        </div>{/* end sliderRef outer scroll wrapper */}

        {/* Ketua quote block */}
        <FadeIn delay={0.15}>
          <div className="mt-6 p-8 rounded-3xl"
            style={{ background: 'rgba(247,243,232,0.06)', border: '1px solid rgba(247,243,232,0.12)' }}>
            <div className="text-5xl mb-3" style={{ color: C.yellow }}>"</div>
            <blockquote className="text-lg font-medium leading-relaxed" style={{ color: C.bgCream }}>
              Menjaga alam Sumatera Barat bukan perkara besar yang hanya bisa dilakukan orang-orang tertentu.
              Ini urusan kita semua — mulai dari hal kecil, bersama-sama, dengan hati yang tulus.
            </blockquote>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center font-black"
                style={{ background: C.yellow, color: C.forest }}>RC</div>
              <div>
                <p className="font-black text-sm" style={{ color: C.bgCream }}>Romelson Candra</p>
                <p className="text-xs" style={{ color: `${C.yellow}BB` }}>Ketua Yayasan Galapagos Lestari Indonesia</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* CTA box */}
        <FadeIn delay={0.25}>
          <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 200 }}
            className="mt-6 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden"
            style={{ background: C.yellow }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-15"
              style={{ background: C.forest, transform: 'translate(30%,-30%)' }} />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <p className="text-sm font-bold mb-2 opacity-70" style={{ color: C.forest }}>🌿 Mari Bergabung!</p>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3" style={{ color: C.forest }}>
                  Punya semangat yang sama<br />untuk menjaga alam?
                </h3>
                <p className="text-sm leading-relaxed max-w-md" style={{ color: C.brown }}>
                  Pintu sekretariat kami selalu terbuka untuk kawan baru! Bergabunglah dengan ratusan relawan yang bergerak bersama menjaga alam Sumatera Barat.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-6 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 whitespace-nowrap"
                  style={{ background: C.forest, color: C.bgCream }}>
                  <Users size={15} /> Gabung Jadi Kawan Relawan
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className="px-6 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 whitespace-nowrap"
                  style={{ background: 'rgba(27,50,38,0.12)', color: C.forest, border: `2px solid ${C.forest}30` }}>
                  <Heart size={15} /> Dukung Gerakan Kami
                </motion.button>
              </div>
            </div>
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEWS SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function NewsSection() {
  const articles = [
    {
      category: 'Catatan Lapangan', categoryColor: C.sage,
      date: '5 November 2026',
      title: 'Menanam Harapan di Hulu Batang Kuranji: Kisah Satu Hari Bersama Warga Matur',
      excerpt: 'Pagi itu, kabut masih menggantung di lereng bukit ketika puluhan relawan Galapagos tiba di Nagari Matur bersama bibit pohon yang siap ditanam...',
      img: 'https://images.unsplash.com/photo-1534361960057-19f4434a327d?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    },
    {
      category: 'Edukasi', categoryColor: C.yellow,
      date: '28 Oktober 2026',
      title: 'Generasi Tanggap: Melatih 80 Pelajar SMA Padang Jadi Relawan Siaga Bencana',
      excerpt: 'Program Siswa Tanggap Bencana kami kini telah menjangkau delapan sekolah di Kota Padang. Yuk simak cerita seru dari balik pelatihannya...',
      img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1573489235842-05dddb86e5f7?w=400&q=80',
    },
    {
      category: 'Aksi Lestari', categoryColor: C.forest,
      date: '12 Oktober 2026',
      title: 'Festival Tanam Hulu 2026: Ribuan Pohon, Satu Tekad Menjaga Alam Ranah Minang',
      excerpt: 'Festival Tanam Hulu tahun ini mencatat rekor baru: lebih dari 5.000 bibit pohon endemik Sumatera ditanam dalam satu hari oleh 300+ kawan relawan...',
      img: 'https://images.unsplash.com/photo-1573489235842-05dddb86e5f7?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1534361960057-19f4434a327d?w=400&q=80',
    },
  ];
  return (
    <section id="kabar" className="scroll-mt-28 py-24 relative overflow-hidden" style={{ background: C.bgDark }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
                style={{ background: `${C.sage}18`, color: C.forest, border: `1px solid ${C.sage}30` }}>
                📰 Kabar dari Alam
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: C.forest }}>
                Cerita Terbaru<br /><span style={{ color: C.sage }}>dari Lapangan.</span>
              </h2>
            </div>
            <motion.button whileHover={{ scale: 1.03 }}
              className="px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 shrink-0"
              style={{ border: `2px solid ${C.forest}`, color: C.forest }}>
              Semua Kabar <ChevronRight size={16} />
            </motion.button>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((art, i) => (
            <FadeIn key={art.title} delay={i * 0.12}>
              <motion.article whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300 }}
                className="rounded-3xl overflow-hidden cursor-pointer group"
                style={{ background: C.bgCream, border: '1px solid rgba(27,50,38,0.08)' }}>
                <div className="overflow-hidden h-52">
                  <motion.img whileHover={{ scale: 1.08 }} transition={{ duration: 0.7 }}
                    src={art.img} alt={art.title} className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.src = art.fallback; }} />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                      style={{ background: art.categoryColor, color: '#fff' }}>{art.category}</span>
                    <span className="text-xs" style={{ color: C.brown }}>{art.date}</span>
                  </div>
                  <h3 className="font-black text-base leading-snug mb-2" style={{ color: C.forest }}>{art.title}</h3>
                  <p className="text-sm leading-relaxed mb-4 opacity-70" style={{ color: C.brown }}>{art.excerpt}</p>
                  <motion.button whileHover={{ x: 3 }}
                    className="flex items-center gap-1.5 text-xs font-bold" style={{ color: C.sage }}>
                    Baca Selengkapnya <ArrowUpRight size={14} />
                  </motion.button>
                </div>
              </motion.article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════
function YayasanFooter({ onNavigateTo }) {
  const quickLinks = [
    { label: 'Cerita Kami',     id: 'cerita' },
    { label: 'Ruang Gerak',     id: 'ruang-gerak' },
    { label: 'Jejak Dampak',    id: 'dampak' },
    { label: 'Kawan Galapagos', id: 'komunitas' },
    { label: 'Kabar Alam',      id: 'kabar' },
  ];
  return (
    <footer style={{ background: C.forest }}>
      <div style={{ background: C.bgDark }}>
        <div style={{ background: C.forest, borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem', height: '4rem' }} />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-10">
        <FadeIn>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-14 leading-tight"
            style={{ color: C.yellow }}>
            Salam Lestari<br /><span style={{ color: C.bgCream }}>dari Ranah Minang.</span>
          </h2>
        </FadeIn>
        <div className="grid md:grid-cols-12 gap-10 mb-16">
          {/* About */}
          <FadeIn className="md:col-span-5" delay={0.1}>
            <div>
              <span className="text-2xl font-black" style={{ color: C.bgCream }}>
                Galapagos<span style={{ color: C.yellow }}>.</span>
              </span>
              <p className="text-sm leading-relaxed mt-4 mb-5 opacity-70" style={{ color: C.bgCream }}>
                Yayasan Galapagos Lestari Indonesia — lahir dari semangat pecinta alam Padang pada 31 Agustus 1986.
                Bergerak bersama warga menjaga kelestarian hutan hulu sungai, mitigasi bencana, dan edukasi lingkungan di Sumatera Barat.
              </p>
              <div className="flex items-start gap-2 text-sm" style={{ color: `${C.bgCream}80` }}>
                <MapPin size={15} className="shrink-0 mt-0.5" style={{ color: C.yellow }} />
                <span>Sekretariat: Kota Padang, Sumatera Barat, Indonesia</span>
              </div>
              <div className="flex gap-3 mt-5">
                {[
                  { Icon: InstagramIcon, label: 'Instagram' },
                  { Icon: FacebookIcon,  label: 'Facebook' },
                  { Icon: Mail,          label: 'Email' },
                  { Icon: Globe,         label: 'Website' },
                ].map(({ Icon, label }) => (
                  <motion.a key={label} href="#"
                    whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(247,243,232,0.10)', color: C.bgCream }} title={label}>
                    <Icon size={16} />
                  </motion.a>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Quick links */}
          <FadeIn className="md:col-span-3" delay={0.15}>
            <div>
              <h4 className="text-sm font-black mb-5 tracking-widest uppercase" style={{ color: C.yellow }}>Navigasi</h4>
              <ul className="space-y-3">
                {quickLinks.map(link => (
                  <li key={link.id}>
                    <button onClick={() => goTo(link.id)}
                      className="text-sm opacity-70 hover:opacity-100 transition-opacity text-left"
                      style={{ color: C.bgCream }}>{link.label}</button>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>

          {/* WebGIS */}
          <FadeIn className="md:col-span-4" delay={0.2}>
            <div>
              <h4 className="text-sm font-black mb-5 tracking-widest uppercase" style={{ color: C.yellow }}>WebGIS</h4>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => onNavigateTo('peta')}
                className="w-full p-5 rounded-2xl text-left"
                style={{ background: `${C.yellow}18`, border: `1px solid ${C.yellow}30` }}>
                <div className="flex items-center gap-2 mb-2">
                  <Trees size={20} style={{ color: C.yellow }} />
                  <span className="font-black text-base" style={{ color: C.yellow }}>Peta Festival Tanam Hulu</span>
                  <ArrowUpRight size={16} className="ml-auto" style={{ color: C.yellow }} />
                </div>
                <p className="text-xs opacity-60" style={{ color: C.bgCream }}>
                  Jelajahi peta interaktif titik penanaman pohon dan data konservasi DAS Batang Kuranji.
                </p>
              </motion.button>
              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-sm opacity-60" style={{ color: C.bgCream }}>
                  <Phone size={13} style={{ color: C.yellow }} /><span>+62 751 xxxxxxx (Sekretariat)</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-60" style={{ color: C.bgCream }}>
                  <Mail size={13} style={{ color: C.yellow }} /><span>galapagos.lestari@email.com</span>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(247,243,232,0.10)' }}>
          <p className="text-xs opacity-40" style={{ color: C.bgCream }}>
            © 2026 Yayasan Galapagos Lestari Indonesia. Berdiri sejak 31 Agustus 1986 di Padang, Sumatera Barat.
          </p>
          <div className="flex items-center gap-2">
            <Leaf size={12} style={{ color: C.yellow }} />
            <span className="text-xs font-semibold opacity-50" style={{ color: C.bgCream }}>Menjaga Alam adalah Ibadah</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════
export default function YayasanPage({ onNavigateTo }) {
  return (
    <div style={{ background: C.bgCream, fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}>
      <Navbar onNavigateTo={onNavigateTo} />
      <HeroSection onNavigateTo={onNavigateTo} />
      <MarqueeBanner />
      <BentoExplorer onNavigateTo={onNavigateTo} />
      <StorySection />
      <ImpactSection />
      <ProgramsSection onNavigateTo={onNavigateTo} />
      <CommunitySection />
      <NewsSection />
      <YayasanFooter onNavigateTo={onNavigateTo} />
    </div>
  );
}
