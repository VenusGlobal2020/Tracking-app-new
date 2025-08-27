import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import io from 'socket.io-client';
import MapView from '../components/Map.jsx';
import UserList from '../components/UserList.jsx';
import GeofencePanel from '../components/GeofencePanel.jsx';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [points, setPoints] = useState([]);
  const [stationary, setStationary] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [geofence, setGeofence] = useState(null);
  const [routeToTarget, setRouteToTarget] = useState(null);

  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000', { transports: ['websocket'] });
    socket.emit('register_admin');
    socket.on('location_update', (payload) => {
      setStatuses(prev => ({...prev, [payload.userId]: 'tracking'}));
      if (payload.userId === selected) {
        setPoints(prev => [...prev, { lat: payload.lat, long: payload.long, status: payload.status, timestamp: payload.timestamp }]);
        if (payload.status === 'stationary') setStationary(prev => [...prev, { lat: payload.lat, long: payload.long }]);
      }
    });
    socket.on('geofence_enter', ({ userId }) => {
      if (userId === selected) alert('Selected user entered the geofence!');
    });
    socket.on('geofence_update', ({ userId, geofence }) => {
      if (userId === selected) setGeofence(geofence);
    });
    return () => socket.disconnect();
  }, [selected]);

  useEffect(() => {
    if (!selected) return;
    api.get('/locations/history/'+selected+'?sinceHours=48').then(res => {
      setPoints(res.data);
      setStationary(res.data.filter(p=>p.status==='stationary'));
    });
    api.get('/geofences/'+selected).then(res => setGeofence(res.data));
  }, [selected]);

  const computeRoute = async () => {
    if (!geofence || points.length === 0) return;
    const last = points[points.length-1];
    const start = [last.long, last.lat];
    const end = [geofence.targetLong, geofence.targetLat];
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.join(',')};${end.join(',')}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const json = await res.json();
      const coords = json.routes?.[0]?.geometry?.coordinates || [];
      setRouteToTarget(coords.map(c => [c[1], c[0]]));
    } catch {
      setRouteToTarget([[last.lat, last.long],[geofence.targetLat, geofence.targetLong]]);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <UserList users={users} selected={selected} onSelect={setSelected} statuses={statuses} />
        <div className="md:col-span-2 space-y-4">
          <MapView points={points} stationary={stationary} geofence={geofence} routeToTarget={routeToTarget} />
          <div className="flex gap-3">
            <button onClick={computeRoute} className="px-4 py-2 rounded-xl bg-black text-white">Show Optimal Route</button>
          </div>
          <GeofencePanel userId={selected} onUpdated={setGeofence} />
        </div>
      </div>
    </div>
  )
}
