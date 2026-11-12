import React from 'react';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import { NEWS_DATA } from '../data/mockData';
import ScrollReveal from './ScrollReveal';

export default function NewsSection({ onNavigateToNews, onSelectArticle }) {
  // Show top 3 news on Home page
  const homeNews = NEWS_DATA.slice(0, 3);
  const featuredArticle = homeNews[0];
  const otherArticles = homeNews.slice(1);

  return (
    <section className="py-20 bg-white text-[#1a1a1a] border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <ScrollReveal>
          <div className="mb-12 space-y-2">
            <div className="text-[#2E8068] text-sm uppercase font-semibold tracking-wider">
              Berita & Kegiatan
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
                className="cursor-pointer group"
              >
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.title}
                    className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-[#6b7280]">
                    <span className="text-[#2E8068] font-medium uppercase text-xs">
                      {featuredArticle.category}
                    </span>
                    <span>{featuredArticle.date}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-[#063F35] group-hover:text-[#2E8068] transition-colors">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-[#374151] line-clamp-3">
                    {featuredArticle.summary}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Supporting Articles */}
          <div className="flex flex-col gap-6">
            {otherArticles.map((article, idx) => (
              <ScrollReveal key={article.id} delay={0.1 + idx * 0.08}>
                <div
                  onClick={() => onSelectArticle(article)}
                  className="cursor-pointer group bg-[#F7F5EF] rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-3 text-sm text-[#6b7280]">
                      <span className="text-[#2E8068] font-medium uppercase text-xs">
                        {article.category}
                      </span>
                      <span>{article.date}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#063F35] group-hover:text-[#2E8068] transition-colors line-clamp-2">
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
              className="inline-flex items-center gap-2 text-[#2E8068] font-semibold border-b border-[#2E8068] pb-1 hover:text-[#063F35] hover:border-[#063F35] transition-all duration-300 ease-in-out hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <span>Lihat Semua Berita</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </ScrollReveal>

      </div>
    </section>
  );
}
