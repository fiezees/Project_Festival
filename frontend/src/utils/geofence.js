/**
 * Geofencing & Spatial Guard Utility for Festival Tanam Hulu 2026
 * 
 * Mencegah kecolongan penginputan titik dari luar zona penanaman resmi
 * (misal: peserta mendaftarkan titik saat berada di kosan Cupak Tangah padahal memilih Batu Busuak).
 */

export const CONSERVATION_ZONES = {
  'batu-busuak': {
    id: 'batu-busuak',
    name: 'Batu Busuak, Pauh',
    center: [-0.9085, 100.4532],
    polygon: [
      [100.4480, -0.9140],
      [100.4580, -0.9140],
      [100.4580, -0.9030],
      [100.4480, -0.9030],
      [100.4480, -0.9140],
    ],
    bbox: { minLng: 100.4480, maxLng: 100.4580, minLat: -0.9140, maxLat: -0.9030 },
    toleranceMeters: 600, // Toleransi pinggiran sungai / tebing
  },
  'lambung-bukit': {
    id: 'lambung-bukit',
    name: 'Lambung Bukit, Pauh',
    center: [-0.9168, 100.4410],
    polygon: [
      [100.4360, -0.9220],
      [100.4460, -0.9220],
      [100.4460, -0.9120],
      [100.4360, -0.9120],
      [100.4360, -0.9220],
    ],
    bbox: { minLng: 100.4360, maxLng: 100.4460, minLat: -0.9220, maxLat: -0.9120 },
    toleranceMeters: 600,
  },
  'gunung-nago': {
    id: 'gunung-nago',
    name: 'Gunung Nago, Pauh',
    center: [-0.9254, 100.4321],
    polygon: [
      [100.4270, -0.9310],
      [100.4370, -0.9310],
      [100.4370, -0.9200],
      [100.4270, -0.9200],
      [100.4270, -0.9310],
    ],
    bbox: { minLng: 100.4270, maxLng: 100.4370, minLat: -0.9310, maxLat: -0.9200 },
    toleranceMeters: 600,
  },
  'gunung-sarik': {
    id: 'gunung-sarik',
    name: 'Gunung Sarik, Kuranji',
    center: [-0.8872, 100.4180],
    polygon: [
      [100.4130, -0.8930],
      [100.4230, -0.8930],
      [100.4230, -0.8820],
      [100.4130, -0.8820],
      [100.4130, -0.8930],
    ],
    bbox: { minLng: 100.4130, maxLng: 100.4230, minLat: -0.8930, maxLat: -0.8820 },
    toleranceMeters: 600,
  },
};

/**
 * Hitung jarak Haversine (meter) antara dua koordinat GPS
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Radius bumi dalam meter
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format meter ke satuan pembacaan manusia (m / km)
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Uji Point-in-Polygon (Ray-Casting Algorithm)
 * point: [lng, lat]
 * vs: array of [lng, lat]
 */
export function isPointInPolygon(point, vs) {
  const x = point[0];
  const y = point[1];
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Evaluasi validitas koordinat terhadap zona penanaman
 */
export function validatePointGeofence(latitude, longitude, zoneId = 'batu-busuak') {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lng)) {
    return {
      isValid: false,
      status: 'invalid_coords',
      distanceMeters: null,
      distanceFormatted: '-',
      zoneName: zoneId,
      message: 'Koordinat GPS belum valid.',
    };
  }

  // Normalisasi zoneId
  const cleanId = String(zoneId).trim().toLowerCase().replace(/\s+/g, '-');
  const zone = CONSERVATION_ZONES[cleanId] || CONSERVATION_ZONES['batu-busuak'];

  // 1. Cek apakah titik persis di dalam polygon
  const inPolygon = isPointInPolygon([lng, lat], zone.polygon);

  // 2. Hitung jarak ke titik tengah zona
  const distToCenter = calculateDistanceMeters(lat, lng, zone.center[0], zone.center[1]);

  // Perkiraan jarak ke tepi polygon terluar
  const distFromEdge = inPolygon ? 0 : Math.max(0, distToCenter - 650);

  // Cari zona mana yang paling dekat jika berada di luar zona yang dipilih
  let nearestZone = null;
  let minDistance = Infinity;

  Object.values(CONSERVATION_ZONES).forEach((z) => {
    const d = calculateDistanceMeters(lat, lng, z.center[0], z.center[1]);
    if (d < minDistance) {
      minDistance = d;
      nearestZone = z;
    }
  });

  if (inPolygon || distFromEdge <= zone.toleranceMeters) {
    return {
      isValid: true,
      inPolygon,
      status: 'valid',
      distanceMeters: distFromEdge,
      distanceFormatted: formatDistance(distFromEdge),
      zoneName: zone.name,
      message: `Posisi valid di dalam / zona resmi ${zone.name}.`,
    };
  }

  if (distFromEdge <= 1200) {
    return {
      isValid: true,
      inPolygon: false,
      status: 'warning',
      distanceMeters: distFromEdge,
      distanceFormatted: formatDistance(distFromEdge),
      zoneName: zone.name,
      message: `Posisi berada di perbatasan luar zona ${zone.name} (~${formatDistance(distFromEdge)}).`,
    };
  }

  // Jauh di luar zona (> 1.2 km, seperti kosan di Cupak Tangah vs Batu Busuak)
  return {
    isValid: false,
    inPolygon: false,
    status: 'out_of_bounds',
    distanceMeters: distFromEdge,
    distanceFormatted: formatDistance(distFromEdge),
    zoneName: zone.name,
    nearestZoneName: nearestZone ? nearestZone.name : null,
    message: `Posisi Anda terdeteksi berjarak ${formatDistance(distFromEdge)} di luar zona ${zone.name}. Pastikan Anda berada langsung di lokasi penanaman saat merekam titik.`,
  };
}
