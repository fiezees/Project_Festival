import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  MapPin,
  Search,
  Sprout,
  X,
} from 'lucide-react';
import { getStats, getTanam, getWilayah, getAssetUrl } from '../services/api';
import { LOCATIONS_DATA } from '../data/mockData';
import ScrollReveal from '../components/ScrollReveal';

const TREE_TYPES = ['A', 'B', 'C'];
const TREE_COLORS = {
  A: '#2a9d8f',
  B: '#e9c46a',
  C: '#e4572e',
};
const TREE_SHAPES = {
  A: 'circle',
  B: 'square',
  C: 'triangle',
};
const TREE_LABELS = {
  A: 'Kelas A',
  B: 'Kelas B',
  C: 'Kelas C',
};

const BASEMAP_OPTIONS = [
  {
    id: 'google_hybrid',
    name: 'Google Satelit',
    icon: '🛰️',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Satelit & Label',
    maxZoom: 20,
  },
  {
    id: 'google_streets',
    name: 'Google Jalan',
    icon: '🗺️',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Streets',
    maxZoom: 20,
  },
  {
    id: 'google_terrain',
    name: 'Topografi',
    icon: '⛰️',
    url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
    attribution: '&copy; Google Maps Terrain',
    maxZoom: 20,
  },
  {
    id: 'osm',
    name: 'OSM',
    icon: '🌐',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
  },
];

function markerIcon(treeClass) {
  const color = TREE_COLORS[treeClass] || '#2E8068';
  const shape = TREE_SHAPES[treeClass] || 'circle';
  return L.divIcon({
    className: 'webgis-marker-icon',
    html: `<span class="webgis-marker webgis-marker-${shape}" style="--marker-color:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function createPointPopupHtml(p) {
  const treeLabel = TREE_LABELS[p.jenis_pohon] || p.jenis_pohon || 'Kelas A';
  const treeColor = TREE_COLORS[p.jenis_pohon] || '#2E8068';
  const beforeUrl = getAssetUrl(p.foto_before_url);
  const afterUrl = getAssetUrl(p.foto_after_url);

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; padding: 4px 2px; min-width: 210px; max-width: 250px; color: #1e293b;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 5px;">
        <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background: ${treeColor}20; color: ${treeColor}; padding: 2px 6px; border-radius: 4px;">
          Kelas ${p.jenis_pohon} · ${treeLabel}
        </span>
        <span style="font-size: 10px; font-weight: 700; color: #94a3b8;">
          #TP-${String(p.id).padStart(3, '0')}
        </span>
      </div>

      <div style="font-weight: 800; font-size: 13px; color: #063F35; margin-bottom: 2px; line-height: 1.3;">
        ${p.nama_peserta || 'Tim Penanam'}
      </div>

      <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
        📍 ${p.lokasi_nama || 'Padang'}
      </div>

      <!-- Side-by-side Portrait Thumbnails -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px;">
        <div style="position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 3/4; background: #f1f5f9; border: 1px solid #e2e8f0;">
          <img src="${beforeUrl}" alt="Before (Awal Tanam)" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'133\\' fill=\\'%23f1f5f9\\'><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'10\\' fill=\\'%2394a3b8\\'>Before</text></svg>'" />
          <span style="position: absolute; bottom: 2px; left: 2px; background: rgba(0,0,0,0.68); color: #fff; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px;">Before · Awal</span>
        </div>
        ${
          afterUrl
            ? `<div style="position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 3/4; background: #f1f5f9; border: 1px solid #e2e8f0;">
                <img src="${afterUrl}" alt="After (6 Bulan)" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'100\\' height=\\'133\\' fill=\\'%23f1f5f9\\'><text x=\\'50%\\' y=\\'50%\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' font-size=\\'10\\' fill=\\'%2394a3b8\\'>After</text></svg>'" />
                <span style="position: absolute; bottom: 2px; left: 2px; background: rgba(6,63,53,0.85); color: #F4B91F; font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px;">After · 6 Bln</span>
              </div>`
            : `<div style="position: relative; border-radius: 6px; aspect-ratio: 3/4; background: #f8fafc; border: 1px dashed #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px; text-align: center;">
                <span style="font-size: 9px; font-weight: 700; color: #475569; line-height: 1.2;">After (6 Bln)</span>
                <span style="font-size: 8px; color: #94a3b8; margin-top: 3px; line-height: 1.2;">Menunggu update 6 bulan</span>
              </div>`
        }
      </div>

      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: #64748b; padding-top: 4px; border-top: 1px solid #f1f5f9;">
        <span>Umur: <strong>${p.umur_tanam_bulan || 3} bln</strong></span>
        <span>Estimasi: <strong>${p.jangka_hidup_tahun || 50} thn</strong></span>
      </div>
    </div>
  `;
}

function MapController({ setMapInstance }) {
  const map = useMap();
  useEffect(() => {
    if (map) setMapInstance(map);
  }, [map, setMapInstance]);
  return null;
}

function FitBounds({ data, hasSelectedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (hasSelectedLocation || !data?.features?.length) return;
    const bounds = L.geoJSON(data).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24] });
  }, [data, hasSelectedLocation, map]);
  return null;
}

function FocusLocation({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location?.coordinates) {
      map.setView(location.coordinates, 14, { animate: true });
    } else {
      map.setView([-0.9124, 100.435], 12, { animate: true });
    }
  }, [location, map]);
  return null;
}

function AdaptivePhotoPair({
  beforeUrl,
  afterUrl,
  inspectorMode,
  onZoomBefore,
  onZoomAfter,
}) {
  const [beforeRatio, setBeforeRatio] = useState('portrait'); // 'portrait' | 'landscape'
  const [afterRatio, setAfterRatio] = useState('portrait');

  // Measure natural dimensions on image load
  const handleBeforeLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setBeforeRatio(naturalWidth > naturalHeight * 1.15 ? 'landscape' : 'portrait');
    }
  };

  const handleAfterLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setAfterRatio(naturalWidth > naturalHeight * 1.15 ? 'landscape' : 'portrait');
    }
  };

  const isDetail = inspectorMode === 'detail';
  const bothPortrait = beforeRatio === 'portrait' && afterRatio === 'portrait';
  const bothLandscape = beforeRatio === 'landscape' && afterRatio === 'landscape';

  // Dynamic styling based on orientation & inspector mode
  const getCardClasses = (ratio) => {
    if (isDetail) {
      if (ratio === 'portrait') {
        return 'aspect-[3/4] h-52 sm:h-64 shrink-0';
      }
      return 'aspect-[4/3] flex-1 max-h-52 sm:max-h-64';
    }

    // Normal split view:
    if (bothPortrait) {
      // Both portrait: uniform height, tight 12px gap in the center, zero awkward void
      return 'aspect-[3/4] h-36 sm:h-40 shrink-0';
    }
    if (bothLandscape) {
      // Both landscape: share half width, 4:3 landscape ratio, 10px gap
      return 'aspect-[4/3] flex-1 max-h-36';
    }
    // Mixed orientation:
    if (ratio === 'portrait') {
      return 'aspect-[3/4] h-32 sm:h-36 shrink-0';
    }
    return 'aspect-[4/3] h-32 sm:h-36 shrink-0';
  };

  return (
    <div
      className={`flex items-center justify-center w-full my-1 transition-all ${
        bothLandscape ? 'gap-2.5' : 'gap-3'
      }`}
    >
      {/* Before Photo */}
      <div
        onClick={onZoomBefore}
        className={`relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group shadow-2xs transition-all ${getCardClasses(
          beforeRatio
        )}`}
        title="Klik untuk melihat foto kondisi lahan resolusi penuh"
      >
        <img
          src={getAssetUrl(beforeUrl)}
          alt="Before Lahan"
          onLoad={handleBeforeLoad}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src =
              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" fill="%23f1f5f9"><rect width="300" height="400" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394a3b8">🌱 Foto Belum Ada</text></svg>';
          }}
        />
        <span className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
          Before (Awal)
        </span>
        <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
          <Eye className="w-2.5 h-2.5" /> Zoom
        </span>
      </div>

      {/* After Photo (6 Bulan — opsional) */}
      {afterUrl ? (
        <div
          onClick={onZoomAfter}
          className={`relative rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group shadow-2xs transition-all ${getCardClasses(
            afterRatio
          )}`}
          title="Klik untuk melihat foto perkembangan 6 bulan resolusi penuh"
        >
          <img
            src={getAssetUrl(afterUrl)}
            alt="After (6 Bulan)"
            onLoad={handleAfterLoad}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400" fill="%23f1f5f9"><rect width="300" height="400" fill="%23f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%2394a3b8">🌱 Foto Belum Ada</text></svg>';
            }}
          />
          <span className="absolute bottom-1.5 left-1.5 bg-emerald-950/85 backdrop-blur-xs text-[#F4B91F] text-[9px] font-bold px-1.5 py-0.5 rounded">
            After (6 Bln)
          </span>
          <span className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[8px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
            <Eye className="w-2.5 h-2.5" /> Zoom
          </span>
        </div>
      ) : (
        <div
          className={`relative rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-2.5 text-center gap-1 shadow-2xs ${getCardClasses(
            afterRatio
          )}`}
        >
          <Clock className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-600 leading-tight">
            After (6 Bulan)
          </span>
          <span className="text-[9px] text-slate-400 leading-snug">
            Menunggu foto perkembangan 6 bulan
          </span>
        </div>
      )}
    </div>
  );
}

export default function PetaPage({ onNavigateHome, selectedLocation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState('Semua');
  const [selectedAreaId, setSelectedAreaId] = useState(selectedLocation?.id || '');
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [wilayah, setWilayah] = useState(null);
  const [tanam, setTanam] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [activeBasemap, setActiveBasemap] = useState('google_hybrid');
  const [legendOpen, setLegendOpen] = useState(true);
  const [previewModalPhoto, setPreviewModalPhoto] = useState(null);

  // Layout View Modes: 'split' (detail on top + list below), 'detail' (maximized detail), 'list' (maximized list)
  const [inspectorMode, setInspectorMode] = useState('split');

  // Map instance & references for 2-way sync
  const [mapInstance, setMapInstance] = useState(null);
  const markerLayersRef = useRef(new Map());
  const listContainerRef = useRef(null);

  const currentBasemap = BASEMAP_OPTIONS.find((b) => b.id === activeBasemap) || BASEMAP_OPTIONS[0];
  const defaultCenter = selectedLocation ? selectedLocation.coordinates : [-0.9124, 100.435];
  const defaultZoom = selectedLocation ? 14 : 12;
  const selectedArea = LOCATIONS_DATA.find((l) => l.id === selectedAreaId) || null;

  useEffect(() => {
    if (selectedLocation) setSelectedAreaId(selectedLocation.id || '');
  }, [selectedLocation]);

  useEffect(() => {
    Promise.all([getWilayah(), getTanam(), getStats()])
      .then(([wilayahData, tanamData, statsData]) => {
        setWilayah(wilayahData);
        setTanam(tanamData);
        setStats(statsData);
      })
      .catch((e) => setError(e.message));
  }, []);

  // Filter features based on search, tree class, and region
  const filteredFeatures = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (tanam?.features || []).filter((feature) => {
      const p = feature.properties;
      const matchesSearch =
        !query ||
        [p.id, p.nama_peserta, p.jenis_pohon, p.lokasi_nama, p.lokasi_id].some((v) =>
          String(v ?? '').toLowerCase().includes(query)
        );
      const matchesType = filterJenis === 'Semua' || p.jenis_pohon === filterJenis;
      const matchesArea =
        !selectedAreaId ||
        String(p.lokasi_id || '').toLowerCase() === String(selectedAreaId).toLowerCase() ||
        String(p.lokasi_nama || '').toLowerCase() === String(selectedArea?.name || '').toLowerCase();
      return matchesSearch && matchesType && matchesArea;
    });
  }, [filterJenis, searchTerm, selectedAreaId, selectedArea, tanam]);

  const filteredData = tanam ? { ...tanam, features: filteredFeatures } : null;

  // Clear marker layer references on filter change to avoid stale layers
  useEffect(() => {
    markerLayersRef.current.clear();
  }, [selectedAreaId, filterJenis, searchTerm]);

  // Two-way Selection Handler: Synchronizes Map, Popup, and List
  const handleSelectPoint = (feature, { fly = true, openPopup = true } = {}) => {
    if (!feature) return;
    setSelectedFeature(feature);
    setSelectedRegion(null);

    // If currently in 'list' mode, automatically switch to 'split' so detail is instantly visible
    if (inspectorMode === 'list') {
      setInspectorMode('split');
    }

    const coords = feature.geometry?.coordinates; // [lng, lat]
    if (coords && mapInstance && fly) {
      mapInstance.flyTo([coords[1], coords[0]], 15, { animate: true, duration: 0.8 });
    }

    if (openPopup) {
      const layer = markerLayersRef.current.get(feature.properties.id);
      if (layer) {
        setTimeout(() => {
          layer.openPopup();
        }, 320);
      }
    }
  };

  // Auto-scroll the Point List to keep active item in view without page scrolling
  useEffect(() => {
    if (selectedFeature && listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(
        `[data-point-id="${selectedFeature.properties.id}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedFeature]);

  // Point Index for Next & Previous Stepping
  const currentPointIndex = useMemo(() => {
    if (!selectedFeature) return -1;
    return filteredFeatures.findIndex((f) => f.properties.id === selectedFeature.properties.id);
  }, [selectedFeature, filteredFeatures]);

  const handlePrevPoint = () => {
    if (currentPointIndex > 0) {
      handleSelectPoint(filteredFeatures[currentPointIndex - 1]);
    }
  };

  const handleNextPoint = () => {
    if (currentPointIndex >= 0 && currentPointIndex < filteredFeatures.length - 1) {
      handleSelectPoint(filteredFeatures[currentPointIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Header ── */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#e5e7eb]">
            <div className="space-y-1.5">
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-[#2E8068] hover:text-[#063F35] text-xs font-semibold uppercase tracking-wide mb-2 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Beranda
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#063F35] leading-tight">
                Peta WebGIS Konservasi
              </h1>
              <p className="text-[#6b7280] text-xs sm:text-sm max-w-xl">
                Sistem Informasi Geografis pemantauan titik tanam pohon di Kecamatan Pauh &amp; Kuranji, Kota Padang.
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 bg-white border border-[#e5e7eb] px-4 py-2.5 rounded-xl shadow-xs text-xs sm:text-sm shrink-0">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <div>
                <div className="font-bold text-[#063F35]">Data WebGIS Terverifikasi</div>
                <div className="text-[11px] text-[#6b7280]">Titik Tanam Pauh &amp; Kuranji</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Search & Filter Controls ── */}
        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-[#e5e7eb] p-3.5 rounded-2xl shadow-xs">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID titik (contoh: 101), nama tim, daerah, atau kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-colors"
              />
            </div>

            {/* Area filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F4B91F] shrink-0" />
              <select
                aria-label="Pilih daerah penempatan"
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] transition-colors bg-white font-medium cursor-pointer"
              >
                <option value="">Semua Daerah (4 Lokasi)</option>
                {LOCATIONS_DATA.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} — Kec. {loc.kecamatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Class filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#9ca3af] shrink-0" />
              <select
                aria-label="Pilih kelas pohon"
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] transition-colors bg-white cursor-pointer"
              >
                <option value="Semua">Semua Kelas Pohon</option>
                {TREE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    Kelas {t} ({TREE_LABELS[t]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Parameter GIS Titik Tanam (Sleek Horizontal Metric Strip) ── */}
        <ScrollReveal delay={0.08}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-white border border-[#e5e7eb] px-3.5 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Titik Terfilter</span>
                <span className="text-base font-extrabold text-[#063F35]">
                  {filteredFeatures.length}{' '}
                  <span className="text-xs font-normal text-gray-400">/ {stats?.total ?? 102}</span>
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E8068] flex items-center justify-center">
                <Sprout className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] px-3.5 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Luas Wilayah</span>
                <span className="text-base font-extrabold text-[#063F35]">{stats ? `${stats.luas_ha} ha` : '—'}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[#F4B91F] flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] px-3.5 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Daerah Sasaran</span>
                <span className="text-xs font-bold text-[#063F35] truncate block max-w-[125px]">
                  {selectedArea ? selectedArea.name : 'Semua (4 Lokasi)'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2E8068] flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-white border border-[#e5e7eb] px-3.5 py-2.5 rounded-xl shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Kelas Indikator</span>
                <span className="text-xs font-bold text-[#063F35] block truncate max-w-[125px]">
                  {filterJenis === 'Semua' ? 'Semua (A, B, C)' : `Kelas ${filterJenis}`}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Filter className="w-4 h-4" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Error Banner ── */}
        {error && (
          <ScrollReveal delay={0.05}>
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700">
              {error}. Pastikan backend dan database aktif.
            </div>
          </ScrollReveal>
        )}

        {/* ── Unified GIS Workspace: Map (Left) + Inspector (Right) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* Left: Interactive Leaflet Map */}
          <div className="lg:col-span-7 xl:col-span-7 h-[480px] sm:h-[540px] lg:h-[640px] xl:h-[680px] rounded-2xl overflow-hidden border border-[#d1d5db] shadow-sm relative isolate bg-gray-100">
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              scrollWheelZoom={true}
              className="w-full h-full"
            >
              <MapController setMapInstance={setMapInstance} />

              <TileLayer
                key={activeBasemap}
                attribution={currentBasemap.attribution}
                url={currentBasemap.url}
                maxZoom={currentBasemap.maxZoom}
              />

              {wilayah && (
                <>
                  <GeoJSON
                    key={`wilayah-${selectedAreaId}`}
                    data={wilayah}
                    style={(feature) => {
                      const isMatch =
                        !selectedAreaId ||
                        feature.properties.nama_wilayah
                          ?.toLowerCase()
                          .includes(selectedArea?.name?.toLowerCase());
                      return {
                        color: isMatch ? '#2E8068' : '#9ca3af',
                        weight: isMatch ? 2 : 1,
                        fillColor: isMatch ? '#2E8068' : '#d1d5db',
                        fillOpacity: isMatch ? 0.18 : 0.04,
                      };
                    }}
                    onEachFeature={(feature, layer) => {
                      layer.on('click', () => {
                        setSelectedRegion(feature.properties);
                        setSelectedFeature(null);
                      });
                    }}
                  />
                  <FitBounds data={wilayah} hasSelectedLocation={Boolean(selectedArea)} />
                </>
              )}

              <FocusLocation location={selectedArea} />

              {filteredData && (
                <GeoJSON
                  key={`points-${selectedAreaId}-${filterJenis}-${searchTerm}`}
                  data={filteredData}
                  pointToLayer={(feature, latlng) =>
                    L.marker(latlng, { icon: markerIcon(feature.properties.jenis_pohon) })
                  }
                  onEachFeature={(feature, layer) => {
                    const p = feature.properties;
                    markerLayersRef.current.set(p.id, layer);
                    layer.bindPopup(createPointPopupHtml(p), {
                      maxWidth: 270,
                      minWidth: 210,
                      className: 'custom-webgis-popup',
                      offset: [0, -8],
                    });
                    layer.on('click', () => {
                      handleSelectPoint(feature, { fly: false, openPopup: false });
                    });
                  }}
                />
              )}
            </MapContainer>

            {/* Basemap Switcher Controls (Google Maps Satelit / Jalan / Terrain) */}
            <div className="absolute top-3 right-3 z-20 flex items-center bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-gray-200">
              {BASEMAP_OPTIONS.map((bm) => (
                <button
                  key={bm.id}
                  type="button"
                  onClick={() => setActiveBasemap(bm.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeBasemap === bm.id
                      ? 'bg-[#063F35] text-[#F4B91F] shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  title={bm.attribution}
                >
                  <span>{bm.icon}</span>
                  <span className="hidden sm:inline">{bm.name}</span>
                </button>
              ))}
            </div>

            {/* Legend Overlay - safely docked in bottom-left with collapse toggle */}
            <div className="absolute left-3 bottom-3 z-20 bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-xl p-3 shadow-md max-w-[210px] transition-all">
              <div
                className="flex items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setLegendOpen(!legendOpen)}
                title="Klik untuk menyembunyikan/menampilkan legenda"
              >
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#6b7280]">
                  Legenda Kelas
                </div>
                <span className="text-[10px] text-gray-400 font-bold hover:text-gray-700">
                  {legendOpen ? '▼' : '▲'}
                </span>
              </div>
              {legendOpen && (
                <div className="space-y-1.5 pt-2 mt-1.5 border-t border-gray-100 animate-fade-in">
                  {TREE_TYPES.map((treeClass) => (
                    <div key={treeClass} className="flex items-center gap-2 text-xs text-[#374151]">
                      <span
                        className={`webgis-marker webgis-marker-${TREE_SHAPES[treeClass]}`}
                        style={{ '--marker-color': TREE_COLORS[treeClass] }}
                      />
                      <span>
                        {treeClass} · {TREE_LABELS[treeClass]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Unified WebGIS Inspector Panel (Eye-Level Synchronized, No Page Scroll) */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col bg-white border border-[#e5e7eb] rounded-2xl shadow-sm h-[540px] sm:h-[600px] lg:h-[640px] xl:h-[680px] overflow-hidden">

            {/* Inspector Top Bar: View Mode Controls */}
            <div className="p-3.5 border-b border-[#e5e7eb] flex items-center justify-between bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
                <h3 className="font-bold text-[#063F35] text-sm truncate">
                  {selectedFeature
                    ? `Titik #${String(selectedFeature.properties.id).padStart(3, '0')}`
                    : selectedRegion
                    ? `Wilayah: ${selectedRegion.nama_wilayah}`
                    : `Titik Terdata (${filteredFeatures.length})`}
                </h3>
              </div>

              {/* Inspector View Toggles */}
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setInspectorMode('split')}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    inspectorMode === 'split' ? 'bg-[#063F35] text-[#F4B91F]' : 'text-gray-600 hover:text-black'
                  }`}
                  title="Tampilan Terpadu (Detail & Daftar bersamaan)"
                >
                  Terpadu
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorMode('detail')}
                  disabled={!selectedFeature}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    inspectorMode === 'detail' ? 'bg-[#063F35] text-[#F4B91F]' : 'text-gray-600 hover:text-black'
                  }`}
                  title="Fokus Foto & Detail Penuh"
                >
                  Detail
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorMode('list')}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                    inspectorMode === 'list' ? 'bg-[#063F35] text-[#F4B91F]' : 'text-gray-600 hover:text-black'
                  }`}
                  title="Daftar Lengkap Semua Titik"
                >
                  Daftar
                </button>
              </div>
            </div>

            {/* Inspector Body */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

              {/* ── CARD: Selected Region Info (when a polygon is clicked) ── */}
              {selectedRegion && !selectedFeature && (
                <div className="p-4 border-b border-[#e5e7eb] bg-emerald-50/50 space-y-2.5 shrink-0 animate-fade-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2E8068] block">
                        Kawasan Konservasi Terpilih
                      </span>
                      <h4 className="font-extrabold text-[#063F35] text-base">
                        {selectedRegion.nama_wilayah}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Kecamatan {selectedRegion.kecamatan} · Luas {selectedRegion.luas_ha} ha
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRegion(null)}
                      className="text-gray-400 hover:text-gray-700 p-1 rounded-md cursor-pointer"
                      title="Tutup informasi daerah"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const match = LOCATIONS_DATA.find(
                        (l) => l.name.toLowerCase() === selectedRegion.nama_wilayah.toLowerCase()
                      );
                      if (match) setSelectedAreaId(match.id);
                    }}
                    className="w-full py-1.5 px-3 bg-[#063F35] text-white hover:bg-[#2E8068] text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Filter className="w-3.5 h-3.5 text-[#F4B91F]" />
                    Filter Titik Hanya di {selectedRegion.nama_wilayah}
                  </button>
                </div>
              )}

              {/* ── CARD: Selected Tree Point Detail (With Portrait Photos 3:4 & Attributes) ── */}
              {selectedFeature && inspectorMode !== 'list' && (
                <div
                  className={`p-4 border-b border-[#e5e7eb] bg-white space-y-3 shrink-0 animate-fade-in overflow-y-auto ${
                    inspectorMode === 'detail' ? 'flex-1' : 'max-h-[360px] lg:max-h-[380px]'
                  }`}
                >
                  {/* Point Header & Next/Prev Controls */}
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-gray-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-extrabold text-white shrink-0"
                          style={{ backgroundColor: TREE_COLORS[selectedFeature.properties.jenis_pohon] }}
                        >
                          Kelas {selectedFeature.properties.jenis_pohon}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          #TP-{String(selectedFeature.properties.id).padStart(3, '0')}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-[#063F35] text-sm sm:text-base leading-snug truncate mt-0.5">
                        {selectedFeature.properties.nama_peserta}
                      </h4>
                    </div>

                    {/* Stepping controls (< prev | next >) + Close */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={handlePrevPoint}
                        disabled={currentPointIndex <= 0}
                        className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Titik Sebelumnya"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-[10px] font-bold text-gray-400 px-1">
                        {currentPointIndex + 1}/{filteredFeatures.length}
                      </span>
                      <button
                        type="button"
                        onClick={handleNextPoint}
                        disabled={currentPointIndex >= filteredFeatures.length - 1}
                        className="p-1 rounded-md border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Titik Selanjutnya"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedFeature(null)}
                        className="p-1 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 cursor-pointer ml-1"
                        title="Tutup Detail"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Smart Adaptive Photos (Dynamically detects portrait/landscape & adjusts space) */}
                  <AdaptivePhotoPair
                    key={`photos-${selectedFeature.properties.id}`}
                    beforeUrl={selectedFeature.properties.foto_before_url}
                    afterUrl={selectedFeature.properties.foto_after_url}
                    inspectorMode={inspectorMode}
                    onZoomBefore={() => setPreviewModalPhoto(selectedFeature.properties.foto_before_url)}
                    onZoomAfter={() => setPreviewModalPhoto(selectedFeature.properties.foto_after_url)}
                  />

                  {/* Metadata Chips & Google Maps Link */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-gray-700 pt-1">
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span className="text-[9px] text-gray-400 font-bold block uppercase">Kawasan Hulu</span>
                      <span className="font-semibold text-[#063F35] truncate block">
                        📍 {selectedFeature.properties.lokasi_nama}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span className="text-[9px] text-gray-400 font-bold block uppercase">Umur &amp; Estimasi</span>
                      <span className="font-semibold text-[#063F35] block">
                        🌱 {selectedFeature.properties.umur_tanam_bulan} bln · ⏳ {selectedFeature.properties.jangka_hidup_tahun} thn
                      </span>
                    </div>
                  </div>

                  {/* External Google Maps Link */}
                  {selectedFeature.geometry?.coordinates && (
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="font-mono text-gray-400 text-[10px]">
                        {selectedFeature.geometry.coordinates[1].toFixed(5)}, {selectedFeature.geometry.coordinates[0].toFixed(5)}
                      </span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedFeature.geometry.coordinates[1]},${selectedFeature.geometry.coordinates[0]}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold hover:underline"
                        title="Buka titik koordinat di Google Maps Satelit"
                      >
                        <span>Satelit Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* ── LIST: All Tree Points (No 40 Limit, Synchronized Scroll) ── */}
              {inspectorMode !== 'detail' && (
                <div className="flex-1 flex flex-col min-h-0 bg-gray-50/40">
                  <div className="px-3.5 py-2 border-b border-[#e5e7eb] bg-white flex items-center justify-between text-xs shrink-0">
                    <span className="font-bold text-[#063F35] flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-[#2E8068]" />
                      Daftar Titik ({filteredFeatures.length})
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {selectedFeature ? 'Klik titik lain untuk berpindah' : 'Klik untuk inspeksi detail'}
                    </span>
                  </div>

                  <div
                    ref={listContainerRef}
                    className="flex-1 p-3 space-y-2 overflow-y-auto"
                  >
                    {filteredFeatures.length === 0 ? (
                      <div className="text-xs text-gray-400 py-12 text-center border border-dashed border-[#e5e7eb] rounded-xl bg-white">
                        Tidak ada titik tanam yang sesuai filter.
                      </div>
                    ) : (
                      filteredFeatures.map((feature) => {
                        const p = feature.properties;
                        const isSelected = selectedFeature?.properties?.id === p.id;
                        return (
                          <div
                            key={p.id}
                            data-point-id={p.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handleSelectPoint(feature)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') handleSelectPoint(feature);
                            }}
                            className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer group select-none ${
                              isSelected
                                ? 'bg-emerald-50/90 border-[#2E8068] ring-2 ring-[#2E8068]/30 shadow-xs'
                                : 'bg-white border-[#e5e7eb] hover:border-[#2E8068] hover:bg-emerald-50/20'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-[#063F35] mb-1">
                              <span className={`truncate pr-2 ${isSelected ? 'text-[#063F35] font-extrabold' : 'group-hover:text-[#2E8068]'}`}>
                                {isSelected && <span className="mr-1">📍</span>}
                                TP-{String(p.id).padStart(3, '0')} — {p.nama_peserta}
                              </span>
                              <span
                                className="text-[10px] px-2 py-0.5 rounded font-bold text-white shrink-0 shadow-2xs"
                                style={{ backgroundColor: TREE_COLORS[p.jenis_pohon] }}
                              >
                                {p.jenis_pohon}
                              </span>
                            </div>
                            <div className="text-[11px] text-[#6b7280] flex items-center justify-between">
                              <span className="truncate">Daerah: {p.lokasi_nama}</span>
                              <span className="shrink-0 font-medium">Umur: {p.umur_tanam_bulan} bln</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>

      {/* MODAL: Fullsize Photo Viewer for WebGIS Point */}
      {previewModalPhoto && (
        <div
          onClick={() => setPreviewModalPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={getAssetUrl(previewModalPhoto)}
              alt="Pratinjau Foto Titik Tanam"
              className="w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800" fill="%231e293b"><rect width="600" height="800" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8">🌱 Foto Belum Dapat Dimuat</text></svg>';
              }}
            />
            <button
              onClick={() => setPreviewModalPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white font-bold flex items-center justify-center hover:bg-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
