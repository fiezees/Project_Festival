/**
 * Backend Geofencing Guard
 * Menghitung jarak GPS titik tanam terhadap batas wilayah penanaman
 */

const CONSERVATION_ZONES = {
  'batu-busuak': {
    name: 'Batu Busuak, Pauh',
    center: [-0.9085, 100.4532],
    polygon: [
      [100.4480, -0.9140],
      [100.4580, -0.9140],
      [100.4580, -0.9030],
      [100.4480, -0.9030],
      [100.4480, -0.9140],
    ],
  },
  'lambung-bukit': {
    name: 'Lambung Bukit, Pauh',
    center: [-0.9168, 100.4410],
    polygon: [
      [100.4360, -0.9220],
      [100.4460, -0.9220],
      [100.4460, -0.9120],
      [100.4360, -0.9120],
      [100.4360, -0.9220],
    ],
  },
  'gunung-nago': {
    name: 'Gunung Nago, Pauh',
    center: [-0.9254, 100.4321],
    polygon: [
      [100.4270, -0.9310],
      [100.4370, -0.9310],
      [100.4370, -0.9200],
      [100.4270, -0.9200],
      [100.4270, -0.9310],
    ],
  },
  'gunung-sarik': {
    name: 'Gunung Sarik, Kuranji',
    center: [-0.8872, 100.4180],
    polygon: [
      [100.4130, -0.8930],
      [100.4230, -0.8930],
      [100.4230, -0.8820],
      [100.4130, -0.8820],
      [100.4130, -0.8930],
    ],
  },
};

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
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

function checkGeofence(latitude, longitude, lokasiId) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  const cleanId = String(lokasiId || 'batu-busuak').trim().toLowerCase().replace(/\s+/g, '-');
  const zone = CONSERVATION_ZONES[cleanId] || CONSERVATION_ZONES['batu-busuak'];

  const distToCenter = calculateDistanceMeters(lat, lng, zone.center[0], zone.center[1]);
  const distFromEdge = Math.max(0, distToCenter - 650);

  const isOutOfZone = distFromEdge > 700;
  const distFormatted = distFromEdge < 1000 ? `${distFromEdge} m` : `${(distFromEdge / 1000).toFixed(1)} km`;

  return {
    isOutOfZone,
    distFromEdge,
    distFormatted,
    zoneName: zone.name,
  };
}

module.exports = {
  checkGeofence,
  calculateDistanceMeters,
  CONSERVATION_ZONES,
};
