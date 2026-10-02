import React from 'react';
import { Sprout, MapPin, Mail, Phone } from 'lucide-react';
import { FESTIVAL_INFO } from '../data/mockData';

export default function Footer({ setActivePage, onOpenProposal }) {
  return (
    <footer className="bg-[#063F35] text-white pt-16 pb-8 border-t border-[#063F35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F4B91F] flex items-center justify-center text-[#063F35] rounded-lg">
                <Sprout className="w-6 h-6" />
              </div>
              <span className="text-lg font-bold text-white">
                Festival Tanam Hulu
              </span>
            </div>

            <p className="text-sm text-white/70 leading-relaxed">
              {FESTIVAL_INFO.tagline}. Aksi nyata konservasi Daerah Aliran Sungai (DAS) untuk mencegah erosi, menahan limpasan, dan memelihara air masa depan.
            </p>
          </div>

          {/* Col 2: Objek Lokasi */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#F4B91F] uppercase tracking-wider">
              Objek Lokasi Aksi
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4B91F]" />
                <span>Batu Busuak (Kec. Pauh)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4B91F]" />
                <span>Lambung Bukit (Kec. Pauh)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4B91F]" />
                <span>Gunung Nago (Kec. Pauh)</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F4B91F]" />
                <span>Gunung Sarik (Kec. Kuranji)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigasi */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#F4B91F] uppercase tracking-wider">
              Navigasi Halaman
            </h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li>
                <button
                  onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left"
                >
                  Beranda
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('peta'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left"
                >
                  Peta WebGIS Pemetaan
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActivePage('berita'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="hover:text-white transition-colors text-left"
                >
                  Berita & Kegiatan
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenProposal}
                  className="hover:text-white transition-colors text-left font-medium text-[#F4B91F]"
                >
                  Ajukan Proposal Tim
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Kontak */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#F4B91F] uppercase tracking-wider">
              Sekretariat & Kontak
            </h4>
            <div className="space-y-3 text-sm text-white/70">
              <p>Sekretariat Bersama Festival Tanam Hulu Kota Padang</p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F4B91F]" />
                <span>info@tanamhulu-padang.id</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F4B91F]" />
                <span>+62 812-6789-2026</span>
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div>
            © 2026 Festival Tanam Hulu Kota Padang. All Rights Reserved.
          </div>
          <div>
            Sumatera Barat
          </div>
        </div>

      </div>
    </footer>
  );
}
