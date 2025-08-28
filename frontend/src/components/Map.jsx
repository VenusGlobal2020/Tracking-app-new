import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';

function catmullRomSpline(points, segments = 8) {
  if (points.length < 4) return points;
  const res = [];
  for (let i=0; i<points.length-3; i++) {
    const p0 = points[i], p1 = points[i+1], p2 = points[i+2], p3 = points[i+3];
    for (let j=0; j<segments; j++) {
      const t = j/segments;
      const t2 = t*t;
      const t3 = t2*t;
      const x = 0.5*((2*p1[1]) + (-p0[1] + p2[1])*t + (2*p0[1] - 5*p1[1] + 4*p2[1] - p3[1])*t2 + (-p0[1] + 3*p1[1] - 3*p2[1] + p3[1])*t3);
      const y = 0.5*((2*p1[0]) + (-p0[0] + p2[0])*t + (2*p0[0] - 5*p1[0] + 4*p2[0] - p3[0])*t2 + (-p0[0] + 3*p1[0] - 3*p2[0] + p3[0])*t3);
      res.push([y, x]);
    }
  }
  res.push(points[points.length-2]);
  res.push(points[points.length-1]);
  return res;
}

// Custom icons
const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView({ points=[], stationary=[], geofence=null, routeToTarget=null }) {
  const mapRef = useRef(null);
  const center = points.length ? [points[points.length-1].lat, points[points.length-1].long] : [28.6139, 77.2090];

  const polyPoints = points.map(p => [p.lat, p.long]);
  const smooth = useMemo(() => polyPoints.length >= 4 ? catmullRomSpline(polyPoints) : polyPoints, [polyPoints]);

  useEffect(() => {
    if (mapRef.current && center) {
      const map = mapRef.current;
      if (map.flyTo) map.flyTo(center, 13, { duration: 0.5 });
    }
  }, [center?.[0], center?.[1]]);

  return (
    <MapContainer center={center} zoom={13} ref={mapRef} className="w-full h-[600px] rounded-2xl shadow bg-white">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Blue Path */}
      {smooth.length >= 2 && <Polyline positions={smooth} pathOptions={{ color: 'blue', weight: 4 }} />}

      {/* Start Point → Green Marker */}
      {points.length > 0 && (
        <Marker position={[points[0].lat, points[0].long]} icon={startIcon}>
          <Popup>
            <div className="text-sm">
              <div><b>Tracking Started</b></div>
              <div><b>Status:</b> {points[0].status}</div>
              <div><b>Time:</b> {new Date(points[0].timestamp).toLocaleString()}</div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* End Point → Red Marker */}
      {points.length > 1 && (
        <Marker position={[points[points.length-1].lat, points[points.length-1].long]} icon={endIcon}>
          <Popup>
            <div className="text-sm">
              <div><b>Tracking Stopped</b></div>
              <div><b>Status:</b> {points[points.length-1].status}</div>
              <div><b>Time:</b> {new Date(points[points.length-1].timestamp).toLocaleString()}</div>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Stationary points → No markers */}

      {/* Geofence */}
      {geofence && (
        <Circle center={[geofence.targetLat, geofence.targetLong]} radius={geofence.radius}>
          <Popup>Geofence radius: {geofence.radius} m</Popup>
        </Circle>
      )}

      {/* Route to target */}
      {routeToTarget && routeToTarget.length >= 2 && <Polyline positions={routeToTarget} />}
    </MapContainer>
  );
}
