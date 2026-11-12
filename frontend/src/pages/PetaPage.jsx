import React, { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  ArrowLeft,
  Filter,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { getStats, getTanam, getWilayah } from '../services/api';
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

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ── Header ── */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-8 border-b border-[#e5e7eb]">
            <div className="space-y-2">
              <button
                onClick={onNavigateHome}
                className="inline-flex items-center gap-1.5 text-[#2E8068] hover:text-[#063F35] text-xs font-semibold uppercase tracking-wide mb-3 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Kembali ke Beranda
              </button>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#063F35] leading-tight">
                Peta WebGIS
              </h1>
              <p className="text-[#6b7280] text-sm max-w-xl">
                Sistem Informasi Geografis 100 titik tanam di Kecamatan Pauh &amp; Kuranji, Kota Padang.
              </p>
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3 bg-white border border-[#e5e7eb] px-4 py-3 rounded-lg shadow-sm text-sm shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#2E8068] shrink-0" />
              <div>
                <div className="font-semibold text-[#063F35] text-sm">WebGIS Monitoring Active</div>
                <div className="text-xs text-[#6b7280] mt-0.5">Data demo terhubung ke API</div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Filter & Search Bar ── */}
        <ScrollReveal delay={0.05}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-[#e5e7eb] p-4 rounded-lg shadow-sm">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-[#9ca3af] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID titik, peserta, daerah, atau kelas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#1a1a1a] placeholder-[#9ca3af] focus:outline-none focus:border-[#2E8068] focus:ring-1 focus:ring-[#2E8068]/30 transition-colors"
              />
            </div>

            {/* Area filter */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F4B91F] shrink-0" />
              <select
                aria-label="Pilih daerah penempatan"
                value={selectedAreaId}
                onChange={(e) => setSelectedAreaId(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] transition-colors bg-white font-medium"
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
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full border border-[#e5e7eb] rounded-lg px-3 py-2.5 text-sm text-[#1a1a1a] focus:outline-none focus:border-[#2E8068] transition-colors bg-white"
              >
                <option value="Semua">Semua Kelas</option>
                {TREE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Error Banner ── */}
        {error && (
          <ScrollReveal delay={0.05}>
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}. Pastikan backend dan database aktif.
            </div>
          </ScrollReveal>
        )}

        {/* ── Map + Side Panel ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Leaflet Map */}
          <ScrollReveal className="lg:col-span-2 space-y-4" amount={0.1}>
            {/* Map Container */}
            <div className="h-[500px] sm:h-[580px] rounded-lg overflow-hidden border border-[#d1d5db] shadow-sm relative">
              <MapContainer
                center={defaultCenter}
                zoom={defaultZoom}
                scrollWheelZoom={true}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                        layer.on('click', () => setSelectedRegion(feature.properties));
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
                      layer.on('click', () => setSelectedFeature(feature));
                    }}
                  />
                )}
              </MapContainer>

              {/* Legend Overlay */}
              <div className="absolute left-3 bottom-3 z-[400] bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-lg p-3 shadow-md">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#6b7280] mb-2">
                  Legenda Kelas
                </div>
                <div className="space-y-1.5">
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
              </div>
            </div>

            {/* Region info panel */}
            {selectedRegion ? (
              <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 flex items-start justify-between gap-4 shadow-sm">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-[#2E8068]">
                    Daerah terpilih
                  </p>
                  <h3 className="text-lg font-bold text-[#063F35] mt-1">
                    {selectedRegion.nama_wilayah}
                  </h3>
                  <p className="text-sm text-[#6b7280] mt-0.5">
                    Kecamatan {selectedRegion.kecamatan}
                  </p>
                  <p className="text-xs text-[#374151] mt-2">
                    Luas penempatan: {selectedRegion.luas_ha} ha
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRegion(null)}
                  className="text-xs text-[#6b7280] hover:text-[#063F35] font-semibold transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-[#d1d5db] rounded-lg p-4 text-xs text-[#9ca3af] text-center">
                Klik salah satu polygon daerah pada peta untuk melihat informasinya di sini.
              </div>
            )}

            {/* Selected Feature Panel */}
            {selectedFeature && (
              <div className="bg-white border border-[#e5e7eb] rounded-lg p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#F4B91F]">
                      Titik terpilih
                    </p>
                    <h3 className="text-lg font-bold text-[#063F35] mt-1">
                      {selectedFeature.properties.nama_peserta}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFeature(null)}
                    className="text-xs text-[#6b7280] hover:text-[#063F35] font-semibold transition-colors"
                  >
                    Tutup
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <img
                      src={selectedFeature.properties.foto_before_url}
                      alt={`Foto before ${selectedFeature.properties.nama_peserta}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <span className="text-[10px] text-[#9ca3af] mt-1 block">Before</span>
                  </div>
                  <div>
                    <img
                      src={selectedFeature.properties.foto_after_url}
                      alt={`Foto after ${selectedFeature.properties.nama_peserta}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <span className="text-[10px] text-[#9ca3af] mt-1 block">After</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#374151]">
                  <span>ID: TP-{String(selectedFeature.properties.id).padStart(3, '0')}</span>
                  <span>Daerah: {selectedFeature.properties.lokasi_nama}</span>
                  <span>Kelas: {selectedFeature.properties.jenis_pohon}</span>
                  <span>Umur: {selectedFeature.properties.umur_tanam_bulan} bulan</span>
                </div>
              </div>
            )}
          </ScrollReveal>

          {/* Right: Side Panel */}
          <div className="space-y-4">

            {/* GIS Parameter Card */}
            <ScrollReveal delay={0.1} amount={0.1}>
              <div className="bg-white border border-[#e5e7eb] p-5 rounded-lg shadow-sm space-y-4">
                <h3 className="text-base font-bold text-[#063F35] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#F4B91F]" />
                  Parameter GIS Titik Tanam
                </h3>
                <p className="text-xs text-[#6b7280]">
                  Menampilkan parameter metadata yang direkam untuk setiap bibit pohon di lokasi sasaran.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F7F5EF] p-3 rounded-lg border border-[#e5e7eb]">
                    <span className="text-[#2E8068] block text-[10px] uppercase font-bold mb-1">
                      Titik Terfilter
                    </span>
                    <span className="font-bold text-[#F4B91F] text-lg">
                      {filteredFeatures.length}
                      <span className="text-xs text-[#9ca3af] font-normal ml-1">
                        / {stats?.total ?? 100}
                      </span>
                    </span>
                  </div>
                  <div className="bg-[#F7F5EF] p-3 rounded-lg border border-[#e5e7eb]">
                    <span className="text-[#2E8068] block text-[10px] uppercase font-bold mb-1">
                      Luas Wilayah
                    </span>
                    <span className="font-medium text-[#063F35] text-sm">
                      {stats ? `${stats.luas_ha} ha` : '—'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#F7F5EF] p-3 rounded-lg border border-[#e5e7eb]">
                    <span className="text-[#2E8068] block text-[10px] uppercase font-bold mb-1">
                      Daerah Aktif
                    </span>
                    <span className="font-medium text-[#063F35] text-xs">
                      {selectedArea ? selectedArea.name : 'Semua Daerah'}
                    </span>
                  </div>
                  <div className="bg-[#F7F5EF] p-3 rounded-lg border border-[#e5e7eb]">
                    <span className="text-[#2E8068] block text-[10px] uppercase font-bold mb-1">
                      Kelas Indikator
                    </span>
                    <span className="font-medium text-[#063F35] text-xs">{filterJenis}</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Point List */}
            <ScrollReveal delay={0.15} amount={0.08}>
              <div className="bg-white border border-[#e5e7eb] p-5 rounded-lg shadow-sm space-y-3 min-h-[400px] max-h-[520px] lg:max-h-[600px] overflow-y-auto">
                <h4 className="text-sm font-bold text-[#063F35] flex items-center justify-between">
                  <span>Titik Terdata ({filteredFeatures.length})</span>
                  <Sprout className="w-4 h-4 text-[#2E8068]" />
                </h4>

                <div className="space-y-2">
                  {filteredFeatures.length === 0 ? (
                    <div className="text-xs text-[#9ca3af] py-10 text-center border border-dashed border-[#e5e7eb] rounded-lg">
                      Tidak ada titik tanam yang sesuai filter.
                    </div>
                  ) : (
                    filteredFeatures.slice(0, 40).map((feature) => {
                      const p = feature.properties;
                      return (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedFeature(feature)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedFeature(feature);
                          }}
                          className="p-3 rounded-lg border text-xs bg-[#F7F5EF] border-[#e5e7eb] hover:border-[#2E8068] hover:bg-white transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between font-semibold text-[#063F35] mb-1">
                            <span className="group-hover:text-[#2E8068] transition-colors">
                              TP-{String(p.id).padStart(3, '0')} — {p.nama_peserta}
                            </span>
                            <span
                              className="text-[10px] px-2 py-0.5 rounded font-bold text-white shrink-0"
                              style={{ backgroundColor: TREE_COLORS[p.jenis_pohon] }}
                            >
                              {p.jenis_pohon}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#6b7280] flex items-center justify-between mt-0.5">
                            <span>Daerah: {p.lokasi_nama}</span>
                            <span>Umur: {p.umur_tanam_bulan} bln</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>

      </div>
    </div>
  );
}
