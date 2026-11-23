import React, { useState, useEffect } from 'react';
import { 
  Newspaper, Search, ArrowLeft, Calendar, User, Clock, 
  ChevronRight, X, Tag, Share2, Eye, Check, ExternalLink
} from 'lucide-react';
import { getNews, getNewsCategories, getNewsDetail, getAssetUrl } from '../services/api';
import { NEWS_DATA } from '../data/mockData';

export default function BeritaPage({ onNavigateHome, selectedArticle, setSelectedArticle }) {
  const [newsList, setNewsList] = useState([]);
  const [categories, setCategories] = useState(['Semua']);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [copiedLink, setCopiedLink] = useState(false);
  const [fullArticleDetail, setFullArticleDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Load news and categories on mount
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        const [newsRes, catsRes] = await Promise.all([
          getNews().catch(() => null),
          getNewsCategories().catch(() => null),
        ]);

        if (!isMounted) return;

        if (newsRes && newsRes.data && newsRes.data.length > 0) {
          // Normalize API data to UI structure
          const formatted = newsRes.data.map((item) => ({
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
            viewsCount: item.views_count || 0,
            isFeatured: Boolean(item.is_featured),
          }));
          setNewsList(formatted);
        } else {
          // Fallback to initial mock data if API empty/offline
          setNewsList(NEWS_DATA);
        }

        if (catsRes && catsRes.data && catsRes.data.length > 0) {
          const catNames = ['Semua', ...catsRes.data.map((c) => c.nama)];
          setCategories(catNames);
        } else {
          setCategories(['Semua', 'Persiapan', 'Edukasi', 'Pengumuman', 'Konservasi', 'Inovasi', 'Komunitas']);
        }
      } catch (err) {
        console.warn('Gagal memuat berita dinamis, menggunakan data cadangan:', err);
        setNewsList(NEWS_DATA);
        setCategories(['Semua', 'Persiapan', 'Edukasi', 'Pengumuman', 'Konservasi', 'Inovasi', 'Komunitas']);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch full article detail when selectedArticle opens
  useEffect(() => {
    if (!selectedArticle) {
      setFullArticleDetail(null);
      return;
    }

    const identifier = selectedArticle.slug || selectedArticle.id;
    if (!identifier) {
      setFullArticleDetail(selectedArticle);
      return;
    }

    setLoadingDetail(true);
    getNewsDetail(identifier)
      .then((res) => {
        if (res && res.data) {
          const d = res.data;
          setFullArticleDetail({
            id: d.id,
            slug: d.slug,
            title: d.judul,
            category: d.kategori,
            date: d.published_at
              ? new Date(d.published_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : new Date(d.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
            author: d.penulis,
            summary: d.ringkasan,
            content: d.konten,
            image: getAssetUrl(d.gambar_url) || selectedArticle.image,
            readTime: d.waktu_baca || '3 menit',
            viewsCount: d.views_count,
            isFeatured: Boolean(d.is_featured),
          });
        } else {
          setFullArticleDetail(selectedArticle);
        }
      })
      .catch(() => {
        setFullArticleDetail(selectedArticle);
      })
      .finally(() => {
        setLoadingDetail(false);
      });
  }, [selectedArticle]);

  const filteredNews = newsList.filter((item) => {
    const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      (item.title || '').toLowerCase().includes(q) ||
      (item.summary || '').toLowerCase().includes(q) ||
      (item.author || '').toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const activeArticle = fullArticleDetail || selectedArticle;

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  const handleShareWhatsApp = () => {
    if (!activeArticle) return;
    const text = `*${activeArticle.title}*\n\nBaca selengkapnya di Festival Tanam Hulu 2026: ${window.location.origin}/#berita`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Breadcrumb */}
        <div className="border-b border-[#e5e7eb] pb-6 space-y-4">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-[#2E8068] hover:text-[#0B5D4B] text-sm font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#063F35]">
                Warta &amp; Kabar Konservasi
              </h1>
              <p className="text-[#6b7280] text-sm max-w-2xl">
                Dokumentasi persiapan aksi lapangan, publikasi edukasi Daerah Aliran Sungai (DAS), dan kabar resmi Festival Tanam Hulu 2026.
              </p>
            </div>

            <div className="text-xs text-gray-500 bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-xs shrink-0 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-[#2E8068]" />
              <span>{newsList.length} Artikel Resmi Terpublikasi</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-4">
          
          {/* Search bar */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kata kunci berita, nama penulis, atau topik..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#d1d5db] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 shadow-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer shadow-2xs ${
                  activeCategory === cat
                    ? 'bg-[#063F35] text-[#F4B91F] shadow-sm ring-1 ring-[#063F35]'
                    : 'bg-white border border-[#e5e7eb] text-[#374151] hover:bg-[#f3f4f6]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Loading state */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#2E8068] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-gray-500">Memuat kabar berita terbaru...</p>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((article) => (
              <div
                key={article.id || article.slug}
                onClick={() => setSelectedArticle(article)}
                className="cursor-pointer bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3 bg-[#063F35]/90 backdrop-blur-sm text-[#F4B91F] text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-xs uppercase tracking-wide">
                      {article.category}
                    </div>

                    {article.isFeatured && (
                      <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                        <span>📌</span>
                        <span>Headline</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-[#6b7280]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#2E8068]" />
                        {article.date}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#2E8068]" />
                        {article.readTime}
                      </span>
                      {article.viewsCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-gray-400">
                            <Eye className="w-3.5 h-3.5" />
                            {article.viewsCount}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-[#063F35] group-hover:text-[#2E8068] transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <p className="text-[#374151] text-xs sm:text-sm line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-[#f3f4f6] mt-3 flex items-center justify-between text-xs font-semibold text-[#2E8068] transition-colors">
                  <span className="flex items-center gap-1.5 text-[#374151] truncate max-w-[150px]">
                    <User className="w-3.5 h-3.5 text-[#6b7280]" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1 group-hover:text-[#0B5D4B] shrink-0">
                    Baca Artikel
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}

        {!loading && filteredNews.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#e5e7eb] shadow-xs">
            <Newspaper className="w-12 h-12 text-[#9ca3af] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#063F35]">Tidak ada artikel berita ditemukan</h3>
            <p className="text-[#6b7280] text-xs sm:text-sm mt-1">Coba gunakan kata kunci pencarian lain atau pilih kategori 'Semua'.</p>
          </div>
        )}

        {/* Full Article Modal Viewer with Real API Data */}
        {selectedArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fade-in">
            <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden text-[#1a1a1a] my-8 flex flex-col max-h-[90vh]">
              
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-md transition-colors cursor-pointer"
                title="Tutup Berita"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-60 sm:h-72 shrink-0 overflow-hidden bg-gray-900">
                <img
                  src={activeArticle.image}
                  alt={activeArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-[#F4B91F] text-[#063F35] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                      {activeArticle.category}
                    </span>
                    {activeArticle.isFeatured && (
                      <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                        📌 Berita Utama
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight">
                    {activeArticle.title}
                  </h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
                
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b7280] pb-4 border-b border-[#e5e7eb]">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 font-semibold text-[#063F35]">
                      <User className="w-3.5 h-3.5 text-[#2E8068]" />
                      Oleh: {activeArticle.author}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#6b7280]" />
                      {activeArticle.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#6b7280]" />
                      {activeArticle.readTime}
                    </span>
                    {activeArticle.viewsCount > 0 && (
                      <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <Eye className="w-3.5 h-3.5" />
                        {activeArticle.viewsCount} pembaca
                      </span>
                    )}
                  </div>

                  {/* Share buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleShareWhatsApp}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Bagikan ke WhatsApp"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Salin tautan artikel"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <ExternalLink className="w-3 h-3" />}
                      <span>{copiedLink ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                </div>

                {loadingDetail && (
                  <div className="py-6 text-center text-xs text-gray-400">
                    Memperbarui konten artikel lengkap...
                  </div>
                )}

                <div className="text-[#374151] text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-4">
                  {activeArticle.content}
                </div>

                <div className="pt-6 border-t border-[#e5e7eb] flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-[#6b7280] font-medium">
                    <Tag className="w-3.5 h-3.5 text-[#2E8068]" />
                    <span>Festival Tanam Hulu • Konservasi Air &amp; Vegetasi Pauh &amp; Kuranji</span>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="w-full sm:w-auto bg-[#063F35] hover:bg-[#0B5D4B] text-white font-bold px-6 py-2 rounded-xl text-xs sm:text-sm transition-all cursor-pointer"
                  >
                    Tutup Artikel
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
