import React, { useState } from 'react';
import { Newspaper, Search, ArrowLeft, Calendar, User, Clock, ChevronRight, X, Tag } from 'lucide-react';
import { NEWS_DATA } from '../data/mockData';

export default function BeritaPage({ onNavigateHome, selectedArticle, setSelectedArticle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');

  const categories = ['Semua', 'Persiapan', 'Edukasi', 'Pengumuman', 'Konservasi', 'Inovasi'];

  const filteredNews = NEWS_DATA.filter((item) => {
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.author.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="border-b border-[#e5e7eb] pb-6 space-y-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-[#2E8068] hover:text-[#0B5D4B] text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-sm font-semibold text-[#2E8068] tracking-wide uppercase">Pusat Informasi</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#063F35]">
                Arsip Berita & Warta
              </h1>
              <p className="text-[#374151] text-base max-w-2xl mt-2">
                Kumpulan kabar, edukasi lingkungan, warta kegiatan, dan pembaruan seputar gerakan konservasi Festival Tanam Hulu.
              </p>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-6">
          
          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari kata kunci berita, pengumuman, atau artikel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#d1d5db] rounded-lg pl-10 pr-4 py-3 text-sm text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 shadow-sm"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                  activeCategory === cat
                    ? 'bg-[#063F35] text-white border border-[#063F35]'
                    : 'bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <div
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="cursor-pointer bg-white border border-[#e5e7eb] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm border border-[#e5e7eb] text-[#063F35] text-xs font-bold px-2 py-1 rounded shadow-sm uppercase">
                    {article.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#2E8068]" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2E8068]" />
                      {article.readTime}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#063F35] group-hover:text-[#2E8068] transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-[#374151] text-sm line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-[#f3f4f6] mt-4 flex items-center justify-between text-sm font-semibold text-[#2E8068] transition-colors">
                <span className="flex items-center gap-1.5 text-[#374151]">
                  <User className="w-4 h-4 text-[#6b7280]" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1 group-hover:text-[#0B5D4B]">
                  Baca Artikel
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>

            </div>
          ))}
        </div>

        {filteredNews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
            <Newspaper className="w-12 h-12 text-[#9ca3af] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#063F35]">Tidak ada berita ditemukan</h3>
            <p className="text-[#6b7280] text-sm mt-2">Coba gunakan kata kunci lain atau pilih kategori 'Semua'.</p>
          </div>
        )}

        {/* Full Article Modal Viewer */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
            <div className="relative w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden text-[#1a1a1a] my-8 flex flex-col">
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur text-[#374151] hover:bg-white hover:text-[#1a1a1a] shadow-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-64 sm:h-80">
                <img
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-10 space-y-8">
                
                <div className="space-y-4">
                  <span className="bg-[#063F35]/10 text-[#063F35] text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#063F35] leading-tight">
                    {selectedArticle.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-[#6b7280] pt-2 pb-4 border-b border-[#e5e7eb]">
                    <span className="flex items-center gap-2 font-medium text-[#1a1a1a]">
                      <User className="w-4 h-4 text-[#2E8068]" />
                      Oleh: {selectedArticle.author}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#6b7280]" />
                      {selectedArticle.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#6b7280]" />
                      {selectedArticle.readTime}
                    </span>
                  </div>
                </div>

                <div className="prose prose-emerald max-w-none text-[#374151] text-base leading-loose whitespace-pre-line">
                  {selectedArticle.content}
                </div>

                <div className="pt-8 mt-8 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-[#6b7280] font-medium">
                    <Tag className="w-4 h-4 text-[#2E8068]" />
                    <span>Festival Tanam Hulu • Kota Padang</span>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="w-full sm:w-auto bg-[#063F35] hover:bg-[#0B5D4B] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Tutup Berita
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
