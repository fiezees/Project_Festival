import React, { useState, useEffect } from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { NEWS_DATA } from '../data/mockData';
import { getNews, getAssetUrl } from '../services/api';
import ScrollReveal from './ScrollReveal';

export default function NewsSection({ onNavigateToNews, onSelectArticle }) {
  const [articles, setArticles] = useState(NEWS_DATA.slice(0, 3));

  useEffect(() => {
    let isMounted = true;
    getNews({ limit: 4 })
      .then((res) => {
        if (!isMounted) return;
        if (res && res.data && res.data.length > 0) {
          const formatted = res.data.map((item) => ({
            id: item.id,
            slug: item.slug,
            title: item.judul,
            category: item.kategori,
            date: item.published_at
              ? new Date(item.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : new Date(item.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
            author: item.penulis,
            summary: item.ringkasan,
            content: item.konten || item.ringkasan,
            image: getAssetUrl(item.gambar_url) || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
            readTime: item.waktu_baca || '3 menit',
            isFeatured: Boolean(item.is_featured),
          }));
          setArticles(formatted);
        }
      })
      .catch(() => {
        // Fallback to mock data if API unavailable
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredArticle = articles[0];
  const otherArticles = articles.slice(1, 4);

  return (
    <section className="py-20 bg-white text-[#1a1a1a] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="mb-12 space-y-2">
            <div className="text-[#2E8068] text-sm uppercase font-semibold tracking-wider">
              Berita &amp; Kegiatan Konservasi
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#063F35]">
              Kabar Terbaru
            </h2>
          </div>
        </ScrollReveal>

        {/* Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Featured Article */}
          {featuredArticle && (
            <ScrollReveal className="lg:col-span-2" delay={0.05}>
              <div 
                onClick={() => onSelectArticle(featuredArticle)}
                className="cursor-pointer group bg-[#F7F5EF]/50 p-4 rounded-2xl border border-gray-100 hover:border-[#2E8068]/30 transition-all hover:shadow-md"
              >
                <div className="mb-4 overflow-hidden rounded-xl relative h-72 bg-gray-100">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-[#063F35]/90 backdrop-blur-sm text-[#F4B91F] text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide">
                    {featuredArticle.category}
                  </div>
                  {featuredArticle.isFeatured && (
                    <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                      📌 Berita Utama
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-xs text-[#6b7280]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#2E8068]" />
                      {featuredArticle.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#2E8068]" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[#063F35] group-hover:text-[#2E8068] transition-colors leading-tight">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-[#374151] line-clamp-3 text-sm leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Supporting Articles */}
          <div className="flex flex-col gap-5">
            {otherArticles.map((article, idx) => (
              <ScrollReveal key={article.id || article.slug || idx} delay={0.1 + idx * 0.08}>
                <div
                  onClick={() => onSelectArticle(article)}
                  className="cursor-pointer group bg-[#F7F5EF] rounded-xl overflow-hidden flex flex-col border border-gray-100 hover:border-[#2E8068]/30 transition-all hover:shadow-sm"
                >
                  <div className="overflow-hidden h-40 bg-gray-100 relative">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-[#063F35]/90 text-[#F4B91F] text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      {article.category}
                    </div>
                  </div>
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                      <span>{article.date}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <h3 className="text-sm font-bold text-[#063F35] group-hover:text-[#2E8068] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

        </div>

        {/* View All News Button */}
        <ScrollReveal delay={0.1}>
          <div className="mt-12 flex justify-start">
            <button
              onClick={onNavigateToNews}
              className="inline-flex items-center gap-2 bg-[#063F35] hover:bg-[#0B5D4B] text-white font-semibold px-6 py-3 rounded-xl text-sm transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Lihat Semua Berita &amp; Artikel
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
