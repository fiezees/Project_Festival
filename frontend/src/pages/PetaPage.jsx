import React, { useEffect, useMemo, useState } from 'react';
import { GeoJSON, MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Filter, Layers, MapPin, Search, ShieldCheck, Sprout } from 'lucide-react';
import { getStats, getTanam, getWilayah } from '../services/api';
import { LOCATIONS_DATA } from '../data/mockData';

const TREE_TYPES = ['A', 'B', 'C'];
const TREE_COLORS = {
  A: '#2a9d8f',
  B: '#e9c46a',
  C: '#e4572e'
};
const TREE_SHAPES = {
  A: 'circle',
  B: 'square',
  C: 'triangle'
};

const TREE_LABELS = {
  A: 'Kelas A',
  B: 'Kelas B',
  C: 'Kelas C'
};

function markerIcon(treeClass) {
  const color = TREE_COLORS[treeClass] || '#34d399';
  const shape = TREE_SHAPES[treeClass] || 'circle';
  return L.divIcon({
    className: 'webgis-marker-icon',
    html: `<span class="webgis-marker webgis-marker-${shape}" style="--marker-color:${color}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
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
      map.setView([-0.9124, 100.4350], 12, { animate: true });
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

  // Center coordinate for Pauh / Padang
  const defaultCenter = selectedLocation ? selectedLocation.coordinates : [-0.9124, 100.4350];
  const defaultZoom = selectedLocation ? 14 : 12;

  const selectedArea = LOCATIONS_DATA.find((location) => location.id === selectedAreaId) || null;

  useEffect(() => {
    if (selectedLocation) {
      setSelectedAreaId(selectedLocation.id || '');
    }
  }, [selectedLocation]);

  useEffect(() => {
    Promise.all([getWilayah(), getTanam(), getStats()])
      .then(([wilayahData, tanamData, statsData]) => {
        setWilayah(wilayahData);
        setTanam(tanamData);
        setStats(statsData);
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  const filteredFeatures = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return (tanam?.features || []).filter((feature) => {
      const properties = feature.properties;
      const matchesSearch = !query || [properties.id, properties.nama_peserta, properties.jenis_pohon, properties.lokasi_nama, properties.lokasi_id]
        .some((value) => String(value ?? '').toLowerCase().includes(query));
      const matchesType = filterJenis === 'Semua' || properties.jenis_pohon === filterJenis;
      
      const matchesArea = !selectedAreaId 
        || String(properties.lokasi_id || '').toLowerCase() === String(selectedAreaId).toLowerCase()
        || String(properties.lokasi_nama || '').toLowerCase() === String(selectedArea?.name || '').toLowerCase();

      return matchesSearch && matchesType && matchesArea;
    });
  }, [filterJenis, searchTerm, selectedAreaId, selectedArea, tanam]);

  const filteredData = tanam ? { ...tanam, features: filteredFeatures } : null;

  return (
    <div className="min-h-screen bg-emerald-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-800/60 pb-6">
          <div className="space-y-1">
            <button
              onClick={onNavigateHome}
              className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-xs font-bold mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda Utama
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-white flex items-center gap-3">
              <MapPin className="w-8 h-8 text-emerald-400" />
              Peta WebGIS Festival Tanam Pohon
            </h1>
            <p className="text-emerald-200/80 text-sm">
              Sistem Informasi Geografis 100 titik tanam di Kecamatan Pauh & Kuranji, Kota Padang.
            </p>
          </div>

          <div className="bg-emerald-900/60 border border-emerald-700/60 px-4 py-2.5 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-white font-extrabold">WebGIS Monitoring Active</div>
              <div className="text-[11px] text-emerald-300">Data demo terhubung ke API</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-emerald-900/40 border border-emerald-800/80 p-4 rounded-2xl backdrop-blur-md">
          
          {/* Search box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari ID titik, peserta, daerah, atau kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-emerald-950/80 border border-emerald-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-500 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
            <select
              aria-label="Pilih daerah penempatan"
              value={selectedAreaId}
              onChange={(event) => setSelectedAreaId(event.target.value)}
              className="w-full bg-emerald-950/80 border border-amber-500/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-300 font-semibold"
            >
              <option value="">Semua Daerah Penempatan (4 Lokasi)</option>
              {LOCATIONS_DATA.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} — Kec. {location.kecamatan}
                </option>
              ))}
            </select>
          </div>

          {/* Kelas Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400 shrink-0" />
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full bg-emerald-950/80 border border-emerald-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="Semua">Semua Kelas</option>
              {TREE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

        </div>

        {error && <div className="rounded-xl border border-red-400/40 bg-red-950/70 px-4 py-3 text-xs font-semibold text-red-200">{error}. Pastikan backend dan database aktif.</div>}

        {/* Main Map & Data Table Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Leaflet Interactive Map View */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[500px] sm:h-[600px] rounded-3xl overflow-hidden border border-emerald-700/60 shadow-2xl relative">
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
                        const isMatch = !selectedAreaId || feature.properties.nama_wilayah?.toLowerCase().includes(selectedArea?.name?.toLowerCase());
                        return {
                          color: isMatch ? '#34d399' : '#6b7280',
                          weight: isMatch ? 2.5 : 1,
                          fillColor: isMatch ? '#10b981' : '#374151',
                          fillOpacity: isMatch ? 0.25 : 0.05
                        };
                      }}
                      onEachFeature={(feature, layer) => {
                        const properties = feature.properties;
                        layer.on('click', () => setSelectedRegion(properties));
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
                    pointToLayer={(feature, latlng) => {
                      return L.marker(latlng, { icon: markerIcon(feature.properties.jenis_pohon) });
                    }}
                    onEachFeature={(feature, layer) => {
                      layer.on('click', () => setSelectedFeature(feature));
                    }}
                  />
                )}

              </MapContainer>

              <div className="absolute left-4 bottom-4 z-[400] bg-emerald-950/90 border border-emerald-700/80 rounded-2xl p-3 shadow-xl backdrop-blur-sm">
                <div className="text-[10px] uppercase font-black tracking-wider text-emerald-300 mb-2">Legenda kelas</div>
                <div className="space-y-1.5">
                  {TREE_TYPES.map((treeClass) => (
                    <div key={treeClass} className="flex items-center gap-2 text-xs text-white">
                      <span
                        className={`webgis-marker webgis-marker-${TREE_SHAPES[treeClass]}`}
                        style={{ '--marker-color': TREE_COLORS[treeClass] }}
                      />
                      <span>{treeClass} · {TREE_LABELS[treeClass]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {selectedRegion ? (
              <div className="bg-emerald-900/60 border border-emerald-600/70 rounded-3xl p-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-black text-emerald-400">Daerah terpilih</p>
                  <h3 className="text-xl font-black text-white mt-1">{selectedRegion.nama_wilayah}</h3>
                  <p className="text-sm text-emerald-200 mt-1">Kecamatan {selectedRegion.kecamatan}</p>
                  <p className="text-xs text-emerald-300 mt-3">Luas penempatan: {selectedRegion.luas_ha} ha</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedRegion(null)}
                  className="text-xs text-emerald-300 hover:text-white font-bold"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-emerald-700/70 rounded-3xl p-4 text-xs text-emerald-300">
                Klik salah satu polygon daerah pada peta untuk melihat informasinya di sini.
              </div>
            )}

            {selectedFeature && (
              <div className="bg-emerald-900/60 border border-amber-400/60 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-black text-amber-300">Titik terpilih</p>
                    <h3 className="text-xl font-black text-white mt-1">{selectedFeature.properties.nama_peserta}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFeature(null)}
                    className="text-xs text-emerald-300 hover:text-white font-bold"
                  >
                    Tutup
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <img
                      src={selectedFeature.properties.foto_before_url}
                      alt={`Foto before ${selectedFeature.properties.nama_peserta}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <span className="text-[10px] text-emerald-300 mt-1 block">Before</span>
                  </div>
                  <div>
                    <img
                      src={selectedFeature.properties.foto_after_url}
                      alt={`Foto after ${selectedFeature.properties.nama_peserta}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <span className="text-[10px] text-emerald-300 mt-1 block">After</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-emerald-100">
                  <span>ID: TP-{String(selectedFeature.properties.id).padStart(3, '0')}</span>
                  <span>Daerah: {selectedFeature.properties.lokasi_nama}</span>
                  <span>Kelas: {selectedFeature.properties.jenis_pohon}</span>
                  <span>Umur: {selectedFeature.properties.umur_tanam_bulan} bulan</span>
                </div>
              </div>
            )}
          </div>

          {/* Side Details List / Parameter View */}
          <div className="space-y-4">

            {/* GIS Overview Card */}
            <div className="bg-gradient-to-b from-emerald-900/60 to-emerald-950/80 border border-emerald-800 p-5 rounded-3xl space-y-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                Parameter GIS Titik Tanam
              </h3>
              <p className="text-xs text-emerald-200/80">
                Menampilkan parameter metadata yang direkam untuk setiap bibit pohon di lokasi sasaran.
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Titik Terfilter</span>
                  <span className="font-extrabold text-amber-300 text-sm">{filteredFeatures.length} / {stats?.total ?? 100}</span>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Luas Wilayah</span>
                  <span className="font-medium text-emerald-100">{stats ? `${stats.luas_ha} ha` : '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Daerah Aktif</span>
                  <span className="font-medium text-emerald-100">{selectedArea ? selectedArea.name : 'Semua Daerah'}</span>
                </div>
                <div className="bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/60">
                  <span className="text-emerald-400 block text-[10px] uppercase font-bold">Kelas Indikator</span>
                  <span className="font-medium text-emerald-100">{filterJenis}</span>
                </div>
              </div>
            </div>

            {/* List of Planting Points */}
            <div className="bg-emerald-900/40 border border-emerald-800/80 p-5 rounded-3xl space-y-3 min-h-[440px] max-h-[500px] lg:min-h-[600px] lg:max-h-[640px] overflow-y-auto">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center justify-between">
                <span>Titik Terdata ({filteredFeatures.length})</span>
                <Sprout className="w-4 h-4 text-emerald-400" />
              </h4>

              <div className="space-y-2">
                {filteredFeatures.length === 0 ? (
                  <div className="text-xs text-emerald-300/70 py-8 text-center border border-dashed border-emerald-800/80 rounded-2xl">
                    Tidak ada titik tanam yang sesuai dengan filter.
                  </div>
                ) : (
                  filteredFeatures.slice(0, 40).map((feature) => {
                    const properties = feature.properties;
                    const [lng, lat] = feature.geometry.coordinates;
                    return (
                      <div
                        key={properties.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedFeature(feature)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') setSelectedFeature(feature);
                        }}
                        className="p-3 rounded-2xl border text-xs bg-emerald-950/60 border-emerald-800 hover:border-emerald-500 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between font-bold text-white mb-1">
                          <span>TP-{String(properties.id).padStart(3, '0')} — {properties.nama_peserta}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: TREE_COLORS[properties.jenis_pohon], color: '#fff' }}>
                            {properties.jenis_pohon}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-200/80 mt-1 flex items-center justify-between">
                          <span>Daerah: {properties.lokasi_nama}</span>
                          <span>Umur: {properties.umur_tanam_bulan} bln</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
