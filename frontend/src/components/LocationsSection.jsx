import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, TreePine, ArrowUpRight } from 'lucide-react';
import { LOCATIONS_DATA } from '../data/mockData';

// Fallback image in case Unsplash or network link fails
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80";

// Helper component for smoothly centering the map to active location
function MapController({ activeLoc }) {
  const map = useMap();

  useEffect(() => {
    if (activeLoc && activeLoc.coordinates) {
      map.flyTo(activeLoc.coordinates, 14, {
        animate: true,
        duration: 1.0
      });
    }
  }, [activeLoc, map]);

  return null;
}

// Custom Leaflet marker icon with dynamic hover & active state
function createMarkerIcon(loc, isHovered, isActive) {
  const isHighlighted = isHovered || isActive;
  
  const color = loc.badgeColor === 'emerald' ? '#10b981'
              : loc.badgeColor === 'teal' ? '#0d9488'
              : loc.badgeColor === 'green' ? '#22c55e'
              : '#84cc16';

  const size = isHighlighted ? 42 : 32;

  return L.divIcon({
    className: 'interactive-location-marker-icon',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
        <div style="position: relative; width: ${size}px; height: ${size}px; border-radius: 9999px; background-color: ${color}; border: ${isHighlighted ? '3px' : '2px'} solid #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; color: #ffffff; transform: ${isHighlighted ? 'scale(1.12)' : 'scale(1)'}; transition: transform 0.2s ease;">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isHighlighted ? '20' : '16'}" height="${isHighlighted ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
}

export default function LocationsSection({ onSelectLocationMap }) {
  const [hoveredLocId, setHoveredLocId] = useState(null);
  const [activeLocId, setActiveLocId] = useState(LOCATIONS_DATA[0].id);

  const activeLoc = LOCATIONS_DATA.find((item) => item.id === activeLocId) || LOCATIONS_DATA[0];

  // Default map center encompassing all 4 locations around Pauh & Kuranji
  const defaultCenter = [-0.909, 100.436];
  const defaultZoom = 13;

  return (
    <section className="py-12 lg:py-16 bg-[#F7F5EF] border-b border-[#e5e7eb]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col gap-2">
          <div className="text-sm tracking-wide text-[#2E8068] uppercase font-semibold">
            Lokasi Kegiatan
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-[#063F35]">
            Empat Lokasi, Satu Gerakan
          </h2>
          <p className="text-[#374151] max-w-2xl mt-2 text-base">
            Festival Tanam Hulu difokuskan pada empat lokasi strategis di sekitar daerah aliran sungai untuk memaksimalkan dampak restorasi lingkungan. Arahkan kursor atau klik kartu untuk fokus pada peta interaktif.
          </p>
        </div>

        {/* 1. HORIZONTAL CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOCATIONS_DATA.map((loc) => {
            const isHovered = hoveredLocId === loc.id;
            const isActive = activeLocId === loc.id;

            return (
              <div
                key={loc.id}
                onMouseEnter={() => setHoveredLocId(loc.id)}
                onMouseLeave={() => setHoveredLocId(null)}
                onClick={() => setActiveLocId(loc.id)}
                className={`group cursor-pointer rounded-lg border bg-white transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isActive
                    ? 'border-[#2E8068] shadow-md ring-1 ring-[#2E8068]/30'
                    : isHovered
                    ? 'border-[#2E8068]/50 shadow-md'
                    : 'border-[#e5e7eb] shadow-sm hover:border-[#2E8068]/50'
                }`}
              >
                {/* Thumbnail Image */}
                <div className="relative h-36 overflow-hidden rounded-t-lg">
                  <img
                    src={loc.image}
                    alt={loc.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-[#374151] text-xs font-semibold px-2 py-1 rounded">
                    Kec. {loc.kecamatan}
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <div>
                    <h3 className={`text-lg font-semibold transition-colors ${isActive ? 'text-[#2E8068]' : 'text-[#063F35]'}`}>
                      {loc.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[#2E8068] font-semibold text-sm">
                      <TreePine className="w-4 h-4" />
                      <span>{loc.targetTrees.toLocaleString('id-ID')} Lubang</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#374151] line-clamp-2">
                    {loc.description}
                  </p>

                  {/* Tree species chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {loc.treeTypes.slice(0, 3).map((tree, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-[#063F35]/5 text-[#2E8068] px-2 py-0.5 rounded"
                      >
                        {tree}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 border-t border-[#e5e7eb] flex items-center justify-between text-sm">
                  <span className={`flex items-center gap-1.5 font-medium ${isActive ? 'text-[#2E8068]' : 'text-[#6b7280]'}`}>
                    <MapPin className="w-4 h-4" />
                    {isActive ? 'Sedang dilihat' : 'Lihat di peta'}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectLocationMap(loc);
                    }}
                    className="text-[#374151] hover:text-[#2E8068] inline-flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>WebGIS</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* 2. FULL-WIDTH MAP */}
        <div className="space-y-2">
          <div className="h-[300px] sm:h-[350px] lg:h-[370px] w-full rounded-lg overflow-hidden border border-[#d1d5db] shadow-sm relative z-0">
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              scrollWheelZoom={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapController activeLoc={activeLoc} />

              {LOCATIONS_DATA.map((loc) => {
                const isHovered = hoveredLocId === loc.id;
                const isActive = activeLocId === loc.id;
                const icon = createMarkerIcon(loc, isHovered, isActive);

                return (
                  <Marker
                    key={loc.id}
                    position={loc.coordinates}
                    icon={icon}
                    eventHandlers={{
                      mouseover: () => setHoveredLocId(loc.id),
                      mouseout: () => setHoveredLocId(null),
                      click: () => {
                        setActiveLocId(loc.id);
                      }
                    }}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -18]}
                      opacity={1}
                      permanent={isHovered || isActive}
                    >
                      <div className="px-2 py-1 text-xs font-semibold text-[#1a1a1a] bg-white rounded shadow-sm border border-[#e5e7eb]">
                        {loc.name}
                      </div>
                    </Tooltip>

                    <Popup className="custom-leaflet-popup">
                      <div className="p-1 space-y-2 max-w-xs">
                        <img
                          src={loc.image}
                          alt={loc.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = FALLBACK_IMAGE;
                          }}
                          className="w-full h-24 object-cover rounded"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-[#063F35]">{loc.name}</h4>
                          <p className="text-xs text-[#6b7280] font-medium mt-1">
                            Kecamatan {loc.kecamatan} • {loc.targetTrees.toLocaleString('id-ID')} Lubang
                          </p>
                          <p className="text-xs text-[#374151] mt-1 line-clamp-2">
                            {loc.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectLocationMap(loc)}
                          className="w-full bg-[#063F35] hover:bg-[#0B5D4B] text-white font-medium text-xs py-2 rounded flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>Buka di WebGIS</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </Popup>

                  </Marker>
                );
              })}
            </MapContainer>

            {/* Map Control Bar Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-sm border border-[#e5e7eb] rounded-lg p-3 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2E8068]" />
                <span className="text-[#374151]">
                  Fokus area: <strong className="text-[#2E8068] font-semibold">{activeLoc.name}</strong> (Kec. {activeLoc.kecamatan}) — {activeLoc.targetTrees.toLocaleString('id-ID')} Lubang Tanam
                </span>
              </div>

              <button
                type="button"
                onClick={() => onSelectLocationMap(activeLoc)}
                className="bg-[#063F35] hover:bg-[#0B5D4B] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors shrink-0"
              >
                <span>Buka WebGIS</span>
                <ArrowUpRight className="w-4 h-4 text-[#F4B91F]" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
