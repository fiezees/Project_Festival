'use client';

import React, { useId, useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  MapPin, Trees, ArrowUpRight, Menu, X, ChevronRight, ChevronLeft,
  Leaf, Heart, Users,
  Mail, Phone, Globe, User,
} from 'lucide-react';
import galapagosLogo from '../assets/logo-galapagos.png';
import watermark1 from '../assets/watermark1.png';
import watermark2 from '../assets/watermark2.png';
import watermark3 from '../assets/watermark3.png';
import watermark4 from '../assets/watermark4.png';
import festivalLogo from '../assets/LogoFestival.png';

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

// ── Galapagos watermark background ────────────────────────────────────────────
function WatermarkPattern({ opacity = 0.32 }) {
  const patternId = `galapagos-watermark-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={patternId} width="320" height="280" patternUnits="userSpaceOnUse">
          <image href={watermark1} x="10" y="12" width="130" height="78" preserveAspectRatio="xMidYMid meet" />
          <image href={watermark2} x="188" y="8" width="82" height="108" preserveAspectRatio="xMidYMid meet" />
          <image href={watermark3} x="18" y="155" width="92" height="92" preserveAspectRatio="xMidYMid meet" />
          <image href={watermark4} x="188" y="150" width="112" height="105" preserveAspectRatio="xMidYMid meet" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
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

  const navLinks = [
    { label: 'Yayasan', id: 'organisasi-yayasan' },
    { label: 'Perkumpulan', id: 'organisasi-perkumpulan' },
    { label: 'SISPALA', id: 'organisasi-sispala' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNav = (id) => {
    setMenuOpen(false);
    setActiveId(id);
    onNavigateTo(id);
  };

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
            onClick={() => onNavigateTo('home')}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="hidden sm:flex items-center gap-2 text-sm font-black px-4 py-2 rounded-full"
            style={{ background: C.yellow, color: C.forest }}>
            <img src={festivalLogo} alt="" className="h-6 w-6 rounded-full bg-white object-contain p-0.5" />
            <span>Festival Tanam Hulu</span>
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
// ═══════════════════════════════════════════════════════════════════════════════
// HERO DECORATIVE VECTOR LAYERS (100% HD crisp SVG — zero blur)
// ═══════════════════════════════════════════════════════════════════════════════
function GoldLeafFlourish({ direction = 'left' }) {
  const flip = direction === 'right' ? 'scale(-1, 1)' : undefined;
  return (
    <svg
      width="20"
      height="13"
      viewBox="0 0 26 16"
      fill="none"
      className="shrink-0"
      style={flip ? { transform: flip } : undefined}
      aria-hidden="true"
    >
      <path d="M24 8 C17 8, 12 4.5, 4 1.5 C8.5 5.5, 13.5 7.5, 24 8 Z" stroke={C.yellowH} strokeWidth="1.2" strokeLinejoin="round" />
      <path d="M24 8 C16 8, 9 8, 1 8 C9 8, 16 8, 24 8 Z" stroke={C.yellowH} strokeWidth="1.15" strokeLinecap="round" />
      <path d="M24 8 C17 8, 12 11.5, 4 14.5 C8.5 10.5, 13.5 8.5, 24 8 Z" stroke={C.yellowH} strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

function ButtonLeafWreath({ side = 'left' }) {
  const flip = side === 'right' ? 'scale(-1, 1)' : undefined;
  return (
    <svg
      width="22"
      height="40"
      viewBox="0 0 44 76"
      fill="none"
      className="pointer-events-none shrink-0 select-none transition-transform duration-300 group-hover:scale-105"
      style={flip ? { transform: flip } : undefined}
      aria-hidden="true"
    >
      <path d="M35 67 C19 59, 12 47, 13 37 C14 26, 22 15, 34 8" stroke="#3F5B35" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M29 12 C27 6, 31 3, 35 3 C35 8, 33 11, 29 12 Z" fill="#8D8238" />
      <path d="M20 20 C14 16, 14 11, 18 9 C22 12, 23 16, 20 20 Z" fill="#6D7639" />
      <path d="M13 33 C6 32, 3 27, 6 23 C11 24, 14 28, 13 33 Z" fill="#4C683D" />
      <path d="M13 45 C6 45, 3 40, 6 36 C11 36, 14 40, 13 45 Z" fill="#3B5636" />
      <path d="M19 56 C12 58, 9 54, 11 49 C16 49, 19 52, 19 56 Z" fill="#324D31" />
      <path d="M27 63 C21 66, 18 63, 19 59 C24 58, 27 60, 27 63 Z" fill="#2B442A" />
    </svg>
  );
}

function DetailedDryLeaf({ w, c1, c2, vein = '#FFF3CE', className = '', style, animate, transition }) {
  return (
    <motion.svg
      width={w}
      height={w * 0.56}
      viewBox="0 0 48 27"
      fill="none"
      className={className}
      style={style}
      animate={animate}
      transition={transition}
    >
      {/* Stem */}
      <path d="M1 15.5 C3.5 15, 5.5 14.5, 7 14" stroke={c2} strokeWidth="1.3" strokeLinecap="round" />
      {/* Leaf blade with organic asymmetric contour */}
      <path d="M6 14 C13 4, 29 2, 46 11 C36 22, 18 25, 6 14 Z" fill={c1} />
      {/* Shaded lower half */}
      <path d="M6 14 C18 25, 36 22, 46 11 C31 13.5, 17 15, 6 14 Z" fill={c2} fillOpacity="0.48" />
      {/* Midrib vein */}
      <path d="M7 14 C19 12, 33 11.5, 44 11.2" stroke={vein} strokeOpacity="0.58" strokeWidth="0.95" strokeLinecap="round" />
      {/* Delicate lateral veins */}
      <path d="M15 13.2 L19.5 8.2 M23 12.4 L28 7.5 M31 11.8 L35.5 8.2 M17 13.5 L21.5 18.2 M25 12.8 L29.5 17.8 M33 12 L37 15.8"
        stroke={vein} strokeOpacity="0.42" strokeWidth="0.7" strokeLinecap="round" />
    </motion.svg>
  );
}

function CtaBrushingLeaves() {
  const leaves = [
    { style: { left: '-16px', top: '-10px', rotate: '-28deg' },   w: 24, c1: '#6F8B56', c2: '#465D36', delay: 0.1 },
    { style: { right: '-12px', top: '-12px', rotate: '22deg' },  w: 28, c1: '#D8A234', c2: '#9E6E1E', delay: 0.35 },
    { style: { left: '16px', bottom: '-10px', rotate: '15deg' }, w: 22, c1: '#C9832B', c2: '#8B541A', delay: 0.55 },
    { style: { right: '-20px', bottom: '-8px', rotate: '-18deg' }, w: 25, c1: '#B58D32', c2: '#785A1E', delay: 0.75 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible z-20 select-none" aria-hidden="true">
      {leaves.map((l, idx) => (
        <DetailedDryLeaf
          key={idx}
          w={l.w}
          c1={l.c1}
          c2={l.c2}
          className="absolute"
          style={l.style}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 4 + idx * 0.5, repeat: Infinity, ease: 'easeInOut', delay: l.delay }}
        />
      ))}
    </div>
  );
}

function FlyingDryLeaves() {
  const leaves = [
    { x: '43%', y: '18%', w: 20, rot: 34,  c1: '#C88D2E', c2: '#8B5D1B', delay: 0.1 },
    { x: '48%', y: '34%', w: 24, rot: -22, c1: '#D8A234', c2: '#996A1D', delay: 0.4 },
    { x: '45%', y: '52%', w: 28, rot: 18,  c1: '#B87B28', c2: '#7D4F16', delay: 0.7 },
    { x: '52%', y: '66%', w: 22, rot: -35, c1: '#8D8238', c2: '#5B5424', delay: 0.3 },
    { x: '38%', y: '78%', w: 26, rot: 26,  c1: '#D49424', c2: '#966516', delay: 0.6 },
    { x: '49%', y: '82%', w: 20, rot: -14, c1: '#A87028', c2: '#6E4618', delay: 0.9 },
    { x: '91%', y: '24%', w: 19, rot: -42, c1: '#C89230', c2: '#895E1C', delay: 0.5 },
    { x: '93%', y: '68%', w: 23, rot: 28,  c1: '#9C8A38', c2: '#645822', delay: 0.8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block overflow-visible z-[6] select-none" aria-hidden="true">
      {leaves.map((l, idx) => (
        <DetailedDryLeaf
          key={idx}
          w={l.w}
          c1={l.c1}
          c2={l.c2}
          className="absolute"
          style={{ left: l.x, top: l.y, rotate: `${l.rot}deg` }}
          animate={{ y: [0, -6, 0], x: [0, 3, 0], rotate: [l.rot, l.rot + 6, l.rot] }}
          transition={{ duration: 4.8 + idx * 0.45, repeat: Infinity, ease: 'easeInOut', delay: l.delay }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════════════════════
function HeroSection({ onNavigateTo }) {
  return (
    <section className="relative flex items-center overflow-visible pt-24 pb-6 lg:pt-24 lg:pb-8"
      style={{ background: C.bgCream }}>
      <WatermarkPattern opacity={0.34} />

      {/* Warm sunlight beams from top-right (smooth CSS gradient — zero blur) */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 56% 58% at 84% 18%, rgba(255,245,212,0.72) 0%, rgba(229,169,60,0.12) 42%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      {/* Larger Crisp HD left & bottom-left botanical fern framing (848x1264 transparent PNG) */}
      <img
        src="/fern-frame-left.png"
        width={848}
        height={1264}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 z-[5] w-[110px] sm:w-[165px] lg:w-[195px] xl:w-[250px] 2xl:w-[295px] h-auto object-contain object-left-bottom select-none opacity-90 lg:opacity-95"
      />

      {/* Top-right balanced HD botanical fern framing (rotated 180deg to mirror bottom-left) */}
      <img
        src="/fern-frame-left.png"
        width={848}
        height={1264}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 z-[5] w-[105px] sm:w-[150px] lg:w-[180px] xl:w-[225px] 2xl:w-[265px] h-auto object-contain select-none opacity-85 lg:opacity-90"
        style={{ transform: 'rotate(180deg)' }}
      />

      <FlyingDryLeaves />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 overflow-visible">

          {/* ── Left Column: Vertikal terpusat dengan lereng kanan, tanpa ruang kosong berlebih ── */}
          <div className="flex flex-col">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{ background: `${C.sage}18`, color: C.forest, border: `1px solid ${C.sage}30` }}>
                Dari Ranah Minang untuk Bumi Sejak 1986
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="mt-4 font-black tracking-tight" style={{ color: C.forest }}>
                <span className="block text-[1.85rem] sm:text-4xl lg:text-[2.25rem] xl:text-[2.6rem] leading-[1.12] sm:whitespace-nowrap">
                  Halo! Kami Perkumpulan
                </span>
                <span className="relative inline-block text-[2.15rem] sm:text-5xl lg:text-[2.6rem] xl:text-[3rem] leading-[1.1] mt-0.5">
                  <span className="relative z-10">Galapagos.</span>
                  <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M4 8 Q50 2 100 7 Q150 12 196 5"
                      stroke={C.yellow} strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3}>
              <p className="mt-4 text-base sm:text-[17px] leading-relaxed max-w-xl" style={{ color: C.brown }}>
                Berawal dari sekumpulan kawan pecinta alam di Padang yang hobi mendaki gunung, kini kami bergerak
                bersama warga menjaga hutan hulu sungai, merawat lingkungan, dan bersiaga menghadapi bencana.
              </p>
            </FadeIn>

            {/* CTA & Stats: rapat tepat di bawah deskripsi (mt-8), sejajar horizontal */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.3 }}
              className="mt-8"
            >
              <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                <div className="relative inline-flex items-center overflow-visible">
                  <CtaBrushingLeaves />
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => goTo('cerita')}
                    className="relative z-10 inline-flex items-center gap-2 h-12 px-6 rounded-full font-bold text-sm cursor-pointer shadow-md"
                    style={{ background: C.forest, color: C.bgCream }}>
                    Kenali Cerita Kami <ChevronRight size={16} />
                  </motion.button>
                </div>

                <div className="flex items-center gap-6">
                  {[['38+','Tahun Berdiri'],['500+','Kawan Relawan']].map(([v,l]) => (
                    <div key={l} className="flex flex-col leading-tight">
                      <span className="text-xl sm:text-2xl font-black" style={{ color: C.yellow }}>{v}</span>
                      <span className="text-xs font-medium" style={{ color: C.brown }}>{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Right Column: HD Waterfall Island + Tagline Rapat + Tombol Ramping Simetris ── */}
          <div className="relative overflow-visible flex flex-col items-center">
            <FadeIn delay={0.25} dir="left" className="w-full overflow-visible">
              <div className="relative flex flex-col items-center w-full max-w-[445px] mx-auto overflow-visible">

                {/* HD waterfall island container (978x893 > 2x supersampled HD) */}
                <div className="relative w-full overflow-visible">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse 64% 58% at 50% 48%, rgba(229,169,60,0.20) 0%, rgba(229,169,60,0.09) 36%, rgba(229,169,60,0.02) 60%, transparent 78%)',
                    }}
                  />

                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 overflow-visible flex justify-center"
                  >
                    <motion.img
                      whileHover={{ scale: 1.015 }}
                      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                      src="/lereng-fth.png"
                      width={978}
                      height={893}
                      alt="Kawasan Lereng Festival Tanam Hulu"
                      className="w-full max-w-[390px] xl:max-w-[435px] h-auto select-none"
                    />
                  </motion.div>

                  {/* Grounding ambient shadow synced with floating island motion */}
                  <div className="relative z-20 -mt-5 pointer-events-none select-none flex flex-col items-center">
                    <motion.div
                      animate={{ scale: [1, 0.91, 1], opacity: [0.95, 0.65, 0.95] }}
                      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-[54%] h-4 rounded-full"
                      style={{
                        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(27,50,38,0.14) 0%, rgba(74,68,59,0.06) 44%, transparent 82%)',
                      }}
                    />
                  </div>
                </div>

                {/* Tagline rapat tepat di bawah lereng */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, type: 'spring' }}
                  className="relative z-10 -mt-2 w-full flex flex-col items-center px-2"
                >
                  <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                    <GoldLeafFlourish direction="left" />
                    <p className="inline-flex items-center gap-1.5 whitespace-nowrap font-extrabold uppercase text-[9.5px] sm:text-[10.5px] xl:text-[11px] tracking-[0.07em]"
                      style={{ color: C.forest }}>
                      <span style={{ color: C.sage }}>Menyemai Lereng</span>
                      <span className="opacity-45">•</span>
                      <span>Selamatkan Padang</span>
                    </p>
                    <GoldLeafFlourish direction="right" />
                  </div>
                  <div
                    className="mt-1 w-full max-w-[300px] h-[1.5px] rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${C.yellow}35 0%, ${C.yellow} 16%, ${C.yellow} 84%, ${C.yellow}35 100%)`,
                    }}
                  />
                </motion.div>

                {/* Tombol FTH lebih ringkas, font membumi (Fraunces), dengan logo FTH dipertahankan */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 60, damping: 18, delay: 0.35 }}
                  className="mt-2.5 relative inline-flex items-center justify-center group overflow-visible"
                >
                  <div className="-mr-2 relative z-20">
                    <ButtonLeafWreath side="left" />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -1.5, boxShadow: `0 10px 22px ${C.yellow}48` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onNavigateTo('home')}
                    className="relative z-10 inline-flex items-center gap-2 h-10 px-4 rounded-full font-semibold text-[13.5px] shadow-md cursor-pointer"
                    style={{
                      background: C.yellow,
                      color: C.forest,
                      fontFamily: "'Fraunces', Georgia, serif",
                      boxShadow: `0 6px 16px ${C.yellow}35`,
                    }}>
                    <img src={festivalLogo} alt=""
                      className="h-6 w-6 rounded-full bg-white object-contain p-0.5 shadow-sm shrink-0" />
                    <span className="tracking-[0.01em]">Kunjungi Situs FTH</span>
                    <ArrowUpRight size={15} strokeWidth={2.2} className="shrink-0" />
                  </motion.button>

                  <div className="-ml-2 relative z-20">
                    <ButtonLeafWreath side="right" />
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
  const text = '✦ SALAM LESTARI ✦ MENJAGA HULU MERAWAT HILIR ✦ PERKUMPULAN GALAPAGOS ✦ BERGERAK BERSAMA KAWAN ✦ SEJAK 31 AGUSTUS 1986 ';
  const rep = text.repeat(4);
  return (
    <div className="relative overflow-hidden py-4 -rotate-1 scale-105 mt-3 mb-10"
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
              Jelajahi Pos Galapagos
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
          <motion.button
            type="button"
            className="relative flex w-full items-center overflow-hidden rounded-3xl border-0 p-0 text-left cursor-pointer"
            style={{ height: '8rem', background: C.yellow }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onHoverStart={() => setHovered('webgis')}
            onHoverEnd={() => setHovered(null)}
            onClick={() => onNavigateTo('home')}>

            <div className="absolute inset-0" style={{ opacity: 0.35 }}>
              <WatermarkPattern opacity={1} />
            </div>

            {/* Decorative circle */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-15"
              style={{ background: C.forest, transform: 'translate(20%,-50%)' }} />

            <div className="relative z-10 flex h-full w-full items-center justify-between gap-4 px-5 sm:px-8">
              <div>
                <motion.div
                  animate={{ rotate: hovered === 'webgis' ? 0 : -1, scale: hovered === 'webgis' ? 1.04 : 1 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 mb-2 shadow"
                  style={{ background: C.forest, borderRadius: '6px' }}>
                  <Trees size={13} style={{ color: C.yellow }} />
                  <span className="text-[11px] font-black tracking-widest uppercase"
                    style={{ color: C.yellow }}>
                    KUNJUNGI FESTIVAL TANAM HULU ↗
                  </span>
                </motion.div>
                <p className="text-sm font-semibold opacity-80" style={{ color: C.forest }}>
                  Kunjungi Festival Tanam Hulu dan jelajahi aksi konservasi DAS Batang Kuranji.
                </p>
              </div>
              <img
                src={festivalLogo}
                alt="Logo Festival Tanam Hulu"
                className="h-16 w-16 shrink-0 rounded-full bg-white object-contain p-1 shadow-sm sm:h-20 sm:w-20"
              />
              <motion.div
                animate={{ x: hovered === 'webgis' ? 5 : 0, y: hovered === 'webgis' ? -5 : 0 }}
                transition={{ type: 'spring', stiffness: 400 }}
                className="hidden sm:flex w-12 h-12 rounded-full items-center justify-center shrink-0 ml-6"
                style={{ background: C.forest }}>
                <ArrowUpRight size={20} style={{ color: C.yellow }} />
              </motion.div>
            </div>
          </motion.button>
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
      color: C.sage,
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80',
      rotate: '2deg',
    },
    {
      year: '2000-an', phase: 'Hadir Saat Bencana Menyapa',
      desc: 'Sumatera Barat dilanda berbagai bencana. Galapagos tak hanya mendaki gunung — mereka turun ke lapangan untuk evakuasi, pemulihan, dan edukasi mitigasi bencana bagi masyarakat yang membutuhkan.',
      color: '#C0392B',
      img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80',
      fallback: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&q=80',
      rotate: '-2deg',
    },
    {
      year: 'Kini', phase: 'Menjaga Hulu & Masa Depan',
      desc: 'Perkumpulan Galapagos kini bersinergi dengan masyarakat, pemerintah, dan kaum muda dalam rehabilitasi hutan, pembinaan Siswa Tanggap Bencana, dan pelestarian DAS Batang Kuranji.',
      color: C.forest,
      img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
      fallback: 'https://images.unsplash.com/photo-1573489235842-05dddb86e5f7?w=400&q=80',
      rotate: '1.5deg',
    },
  ];

  return (
    <section id="cerita" className="scroll-mt-28 py-24 relative overflow-hidden" style={{ background: C.bgDark }}>
      <WatermarkPattern opacity={0.3} />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: `${C.yellow}25`, color: C.forest, border: `1px solid ${C.yellow}40` }}>
              Jurnal Perjalanan
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
            const isEven = i % 2 === 0;
            return (
              <FadeIn key={m.year} delay={i * 0.15} dir={isEven ? 'right' : 'left'}>
                <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black px-3.5 py-1.5 rounded-full shadow-sm"
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
    { value: '38+',     unit: 'Tahun',   desc: 'Mengabdi & Menjaga Alam (Sejak 1986)' },
    { value: '500+',    unit: 'Orang',   desc: 'Kawan Relawan & Siswa Tanggap Bencana' },
    { value: 'Puluhan', unit: 'Nagari',  desc: 'Komunitas Lokal Diberdayakan' },
  ];
  return (
    <section id="dampak" className="scroll-mt-28 py-24 px-4 sm:px-6" style={{ background: C.bgCream }}>
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <div className="relative overflow-hidden p-10 md:p-16"
            style={{ background: C.forest, borderRadius: '2.5rem' }}>
            <WatermarkPattern opacity={0.3} />
            <div className="relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
                  style={{ background: `${C.yellow}25`, color: C.yellow, border: `1px solid ${C.yellow}30` }}>
                  Jejak Langkah Kami
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: C.bgCream }}>
                  Angka-Angka yang<br /><span style={{ color: C.yellow }}>Bercerita Nyata.</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                  <FadeIn key={s.unit} delay={i * 0.12}>
                    <motion.div whileHover={{ scale: 1.04, y: -4 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="p-6 rounded-3xl"
                      style={{ background: 'rgba(247,243,232,0.06)', border: '1px solid rgba(247,243,232,0.12)' }}>
                      <div className="text-4xl font-black" style={{ color: C.yellow }}>{s.value}</div>
                      <div className="text-base font-bold mt-1" style={{ color: C.bgCream }}>{s.unit}</div>
                      <p className="text-sm mt-3 leading-snug opacity-75" style={{ color: C.bgCream }}>{s.desc}</p>
                    </motion.div>
                  </FadeIn>
                ))}
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
    { title: 'Konservasi & Rehabilitasi Hutan',
      desc: 'Pemulihan ekosistem hulu sungai seperti DAS Batang Kuranji, penghijauan lahan kritis, dan pemantauan pohon berkelanjutan bersama masyarakat lokal.',
      hasWebGIS: true, color: C.sage, tag: 'Pilar 01' },
    { title: 'Mitigasi & Tanggap Darurat Bencana',
      desc: 'Pelatihan kesiapsiagaan bencana, tim reaksi cepat kemanusiaan, dan pemetaan kawasan rawan bencana di Sumatera Barat untuk masyarakat yang lebih tangguh.',
      hasWebGIS: false, color: '#C0392B', tag: 'Pilar 02' },
    { title: 'Edukasi & Siswa Tanggap Bencana',
      desc: 'Membina generasi muda dan pelajar di Kota Padang agar mencintai alam sekaligus memiliki keterampilan tanggap bencana sejak dini.',
      hasWebGIS: false, color: C.yellow, tag: 'Pilar 03' },
  ];
  return (
    <section id="ruang-gerak" className="scroll-mt-28 py-24 relative overflow-hidden" style={{ background: C.bgDark }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <FadeIn>
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-4"
              style={{ background: `${C.sage}18`, color: C.forest, border: `1px solid ${C.sage}30` }}>
              Ruang Gerak
            </div>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: C.forest }}>
              Di Mana Kami Bergerak?
            </h2>
            <p className="mt-4 text-base max-w-lg mx-auto" style={{ color: C.brown }}>
              Tiga pilar utama yang menopang setiap langkah Perkumpulan Galapagos di lapangan.
            </p>
          </div>
        </FadeIn>
        <div className="grid md:grid-cols-3 gap-6">
          {programs.map((prog, i) => (
            <FadeIn key={prog.title} delay={i * 0.12}>
              <motion.div whileHover={{ y: -6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative p-7 rounded-3xl cursor-pointer group flex flex-col justify-between"
                style={{ background: C.bgCream, border: '1px solid rgba(27,50,38,0.08)' }}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full"
                      style={{ background: `${prog.color}20`, color: prog.color }}>
                      {prog.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-black mb-3 tracking-tight" style={{ color: C.forest }}>{prog.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: C.brown }}>{prog.desc}</p>
                </div>
                {prog.hasWebGIS && (
                  <motion.button whileHover={{ x: 3 }} onClick={() => onNavigateTo('peta')}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-full self-start"
                    style={{ color: C.forest, background: `${C.yellow}30`, border: `1px solid ${C.yellow}50` }}>
                    <MapPin size={12} /> Lihat di Peta WebGIS <ArrowUpRight size={12} />
                  </motion.button>
                )}
              </motion.div>
            </FadeIn>
          ))}
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
                Kawan Galapagos
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
                <p className="text-sm font-bold mb-2 opacity-70" style={{ color: C.forest }}>Mari Bergabung!</p>
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
      title: 'Festival Tanam Hulu 2026: Bergerak Bersama Menjaga Alam Ranah Minang',
      excerpt: 'Festival Tanam Hulu mengajak relawan dan masyarakat bergerak bersama menjaga ekosistem hulu sungai dan sumber air di Sumatera Barat...',
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
                Kabar dari Alam
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
                Perkumpulan Galapagos — lahir dari semangat pecinta alam Padang pada 31 Agustus 1986.
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
            © 2026 Perkumpulan Galapagos. Berdiri sejak 31 Agustus 1986 di Padang, Sumatera Barat.
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
    <div className="overflow-x-clip" style={{ background: C.bgCream, fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}>
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
