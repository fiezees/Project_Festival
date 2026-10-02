import React from 'react';
import { FESTIVAL_INFO } from '../data/mockData';

export default function Hero({ onOpenProposal, onNavigateToMap, onScrollToTimeline }) {
  const bgImageUrl = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=85";

  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center bg-[#063F35] overflow-hidden">
      
      {/* Background Image with Dark Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${bgImageUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#063F35]/90 via-[#063F35]/60 to-[#063F35]/80" />

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20 lg:py-0">
        <div className="max-w-2xl space-y-8">
          
          <div className="inline-block">
            <span className="text-sm font-semibold text-[#F4B91F] uppercase tracking-wide">
              FESTIVAL TANAM HULU 2026
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Menanam Hari Ini,<br />Menjaga Air Esok Hari
          </h1>

          <p className="text-lg text-white/80 max-w-xl leading-relaxed">
            Gerakan konservasi hulu sungai dan penghijauan berkelanjutan di kawasan Pauh & Kuranji, Kota Padang.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onScrollToTimeline}
              className="bg-[#F4B91F] hover:bg-[#e3a918] text-[#063F35] font-semibold px-6 py-3 rounded-lg transition-colors cursor-pointer"
            >
              Jelajahi Program
            </button>

            <button
              onClick={onNavigateToMap}
              className="border border-white/40 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-lg transition-colors cursor-pointer"
            >
              Lihat WebGIS
            </button>
          </div>

          <div className="pt-8 border-t border-white/20 mt-8">
            <p className="text-sm text-white/70">
              10 Oktober 2026 · 60.000 Titik Tanam · Pauh & Kuranji
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
