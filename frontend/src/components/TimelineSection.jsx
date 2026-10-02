import React from 'react';
import { Calendar, CheckCircle2, Users, Megaphone, FileText, Sprout, Award, Trophy, ArrowRight } from 'lucide-react';
import { TIMELINE_DATA } from '../data/mockData';

const iconMap = {
  Users: Users,
  Megaphone: Megaphone,
  FileText: FileText,
  CheckCircle2: CheckCircle2,
  Sprout: Sprout,
  Award: Award,
  Trophy: Trophy
};

export default function TimelineSection({ onOpenProposal }) {
  return (
    <section id="timeline-section" className="py-16 lg:py-24 bg-white text-[#1a1a1a] relative border-t border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Title */}
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="text-sm tracking-wide text-[#2E8068] uppercase font-semibold">
            Agenda Kegiatan
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-[#063F35]">
            Timeline Festival Tanam Hulu
          </h2>

          <p className="text-[#374151] text-base lg:text-lg max-w-2xl">
            Rangkaian tahapan pelaksanaan kegiatan dimulai dari Oktober 2026 hingga penganugerahan pemenang pada Desember 2026.
          </p>
        </div>

        {/* Timeline Stepper Component */}
        <div className="relative">
          
          {/* Vertical Connecting Line on desktop */}
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-[2px] bg-[#2E8068]/20 transform -translate-x-1/2" />

          <div className="space-y-8 lg:space-y-12">
            {TIMELINE_DATA.map((item, idx) => {
              const IconComponent = iconMap[item.icon] || Calendar;
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.step}
                  className={`relative flex flex-col lg:flex-row items-center ${
                    isEven ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  
                  {/* Content Box */}
                  <div className="w-full lg:w-1/2 lg:px-12">
                    <div className="bg-[#F7F5EF] border border-[#e5e7eb] p-6 rounded-lg shadow-sm">
                      
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <span className="text-xs font-semibold text-[#2E8068] uppercase bg-[#2E8068]/10 px-2 py-1 rounded">
                          Tahap 0{item.step}
                        </span>

                        <span className="flex items-center gap-1.5 text-sm font-medium text-[#6b7280]">
                          <Calendar className="w-4 h-4" />
                          {item.date}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-[#063F35]">
                        {item.title}
                      </h3>

                      <p className="mt-3 text-[#374151] text-sm leading-relaxed">
                        {item.description}
                      </p>

                      {/* Special CTA for Submit Proposal Step */}
                      {item.step === 3 && (
                        <div className="mt-6 pt-4 border-t border-[#e5e7eb] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <span className="text-sm text-[#374151] font-medium">Pendaftaran dibuka untuk umum</span>
                          <button
                            onClick={onOpenProposal}
                            className="bg-[#F4B91F] hover:bg-[#F4B91F]/90 text-[#063F35] font-semibold px-4 py-2 rounded-lg text-sm flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto"
                          >
                            <span>Daftar Sekarang</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Center Node Icon Marker */}
                  <div className="my-6 lg:my-0 z-20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#063F35] flex items-center justify-center text-white ring-4 ring-white">
                      <IconComponent className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Empty Spacer Column for layout symmetry on Desktop */}
                  <div className="hidden lg:block w-1/2" />

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
