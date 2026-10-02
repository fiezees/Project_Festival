import React from 'react';
import { FESTIVAL_INFO } from '../data/mockData';

export default function AboutSection() {
  const imageUrl = "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=80";

  return (
    <section className="bg-[#F7F5EF] text-[#1a1a1a] py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* Image Left */}
          <div className="order-2 lg:order-1">
            <img 
              src={imageUrl} 
              alt="Kawasan hulu sungai dan hutan yang dilindungi" 
              className="w-full h-auto rounded-lg shadow-sm object-cover"
            />
          </div>

          {/* Content Right */}
          <div className="order-1 lg:order-2 space-y-6">
            <span className="text-sm font-semibold text-[#2E8068] uppercase tracking-wide">
              Tentang Program
            </span>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-[#063F35]">
              Apa Itu Festival Tanam Hulu?
            </h2>

            <div className="space-y-4 text-[#374151] text-base leading-relaxed">
              <p>
                Festival Tanam Hulu 2026 adalah gerakan konservasi kolaboratif yang didedikasikan untuk memulihkan dan melindungi ekosistem hulu sungai. Inisiatif ini dirancang sebagai langkah mitigasi jangka panjang terhadap degradasi lingkungan dan perubahan iklim di tingkat lokal.
              </p>
              <p>
                Program ini menargetkan penanaman 60.000 bibit di 4 lokasi strategis kawasan hulu sungai Kecamatan Pauh dan Kuranji untuk melindungi tutupan lahan dan sumber air Kota Padang. Penanaman ini berfokus pada vegetasi berakar kuat yang mampu menahan laju erosi.
              </p>
              <p>
                Melalui kolaborasi pemerintah, masyarakat, akademisi, dan pemuda, festival ini mengintegrasikan teknologi WebGIS untuk monitoring dan transparansi, memastikan setiap bibit yang ditanam dapat dipantau pertumbuhannya secara real-time.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
