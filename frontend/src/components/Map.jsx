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
      {smooth.length >= 2 && <Polyline positions={smooth} />}
      {points.map((p, idx) => (
        <Marker key={idx} position={[p.lat, p.long]}>
          <Popup>
            <div className="text-sm">
              <div><b>Status:</b> {p.status}</div>
              <div><b>Time:</b> {new Date(p.timestamp).toLocaleString()}</div>
            </div>
          </Popup>
        </Marker>
      ))}
      {stationary.map((p, idx) => (
        <Marker key={'s'+idx} position={[p.lat, p.long]}>
          <Popup>Stationary</Popup>
        </Marker>
      ))}
      {geofence && (
        <Circle center={[geofence.targetLat, geofence.targetLong]} radius={geofence.radius}>
          <Popup>Geofence radius: {geofence.radius} m</Popup>
        </Circle>
      )}
      {routeToTarget && routeToTarget.length >= 2 && <Polyline positions={routeToTarget} />}
    </MapContainer>
  );
}
