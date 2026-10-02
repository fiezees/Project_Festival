import React from 'react';
import { FESTIVAL_INFO } from '../data/mockData';

export default function StatsSection() {
  const stats = [
    { value: '60.000', label: 'Titik Tanam' },
    { value: '4', label: 'Lokasi Kegiatan' },
    { value: 'Rp100 Jt', label: 'Total Dana & Hadiah' },
    { value: 'WebGIS', label: 'Monitoring Kegiatan' },
  ];

  return (
    <section className="bg-[#063F35] text-white py-16 lg:py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-12">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className={`flex flex-col text-center lg:text-left ${
                index !== stats.length - 1 ? 'lg:border-r lg:border-white/15' : ''
              } lg:px-8 first:lg:pl-0 last:lg:pr-0`}
            >
              <span className="text-4xl lg:text-5xl font-bold mb-2">
                {stat.value}
              </span>
              <span className="text-sm text-white/60 font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
