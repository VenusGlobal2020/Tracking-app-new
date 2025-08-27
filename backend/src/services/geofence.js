import Geofence from '../models/Geofence.js';

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = x => x * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function checkGeofenceEntry(userId, lat, long) {
  const gf = await Geofence.findOne({ userId, status: 'active' });
  if (!gf) return { inside: false, geofence: null, distance: null };
  const dist = haversine(lat, long, gf.targetLat, gf.targetLong);
  const inside = dist <= gf.radius;
  return { inside, geofence: gf, distance: dist };
}
