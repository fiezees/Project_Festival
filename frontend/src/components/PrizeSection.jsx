import React, { useState } from 'react';
import { Trophy, Crown, Medal, Award, Star, Sparkles, CheckCircle, PartyPopper, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRIZE_DATA, FESTIVAL_INFO } from '../data/mockData';

export default function PrizeSection({ onOpenProposal }) {
  const [activeCategory, setActiveCategory] = useState(0);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  return (
    <section className="py-20 bg-[#F7F5EF] text-[#1a1a1a] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="text-[#2E8068] text-sm uppercase font-semibold tracking-wider">
            Hadiah & Penghargaan
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-[#063F35]">
            Apresiasi untuk Peserta Terbaik
          </h2>

          <p className="text-[#374151] text-base sm:text-lg">
            Apresiasi sebesar <strong>{FESTIVAL_INFO.totalPrizeFormatted}</strong> serta penghargaan resmi tingkat daerah bagi kelompok tani, sekolah, komunitas pemuda, dan peserta aksi konservasi terbaik.
          </p>
        </div>

        {/* Big Highlighted Banner for Total Prize */}
        <div className="bg-[#063F35] text-white rounded-lg p-8 sm:p-12 mb-16 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 text-center md:text-left">
            <div className="text-4xl sm:text-5xl font-bold text-[#F4B91F] tracking-tight">
              Rp 100.000.000
            </div>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              Dilengkapi dengan Trofi Bergilir Wali Kota Padang & Gubernur Sumatera Barat, Sertifikat Konservasi Nasional, serta Hibah Paket Perawatan Pohon.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
            <button
              onClick={triggerConfetti}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#F4B91F] hover:bg-[#e0a719] text-[#063F35] font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              <PartyPopper className="w-5 h-5" />
              <span>Rayakan Festival</span>
            </button>

            <button
              onClick={onOpenProposal}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-transparent hover:bg-white/10 border border-[#F4B91F] text-[#F4B91F] font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
            >
              <Gift className="w-5 h-5" />
              <span>Daftar Tim</span>
            </button>
          </div>

        </div>

        {/* Prize Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {PRIZE_DATA.categories.map((cat, idx) => {
            const isSelected = activeCategory === idx;
            return (
              <div
                key={idx}
                onClick={() => {
                  setActiveCategory(idx);
                  triggerConfetti();
                }}
                className={`cursor-pointer bg-white border rounded-lg p-5 transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#2E8068] shadow-md'
                    : 'border-[#e5e7eb] shadow-sm hover:border-gray-300'
                }`}
              >
                <div>
                  {/* Badge Header */}
                  <div className="w-10 h-10 rounded-lg bg-[#063F35]/10 flex items-center justify-center text-[#063F35] mb-4">
                    {idx === 0 && <Crown className="w-5 h-5" />}
                    {idx === 1 && <Medal className="w-5 h-5" />}
                    {idx === 2 && <Award className="w-5 h-5" />}
                    {idx === 3 && <Star className="w-5 h-5" />}
                    {idx === 4 && <Sparkles className="w-5 h-5" />}
                  </div>

                  <h3 className="text-base font-semibold text-[#063F35] mb-1">
                    {cat.rank}
                  </h3>

                  <div className="text-xl font-bold text-[#F4B91F] mb-4">
                    {cat.amount}
                  </div>

                  {/* Reward list */}
                  <ul className="space-y-2 border-t border-gray-100 pt-4">
                    {cat.rewards.map((rew, rIdx) => (
                      <li key={rIdx} className="text-sm text-[#374151] flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-[#2E8068] shrink-0 mt-0.5" />
                        <span>{rew}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
