// AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/auth.jsx';
import io from 'socket.io-client';
import MapView from '../components/Map.jsx';
import UserList from '../components/UserList.jsx';
import GeofencePanel from '../components/GeofencePanel.jsx';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [points, setPoints] = useState([]);
  const [stationary, setStationary] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [geofence, setGeofence] = useState(null);
  const [routeToTarget, setRouteToTarget] = useState(null);

  const [search, setSearch] = useState('');
  const [filterDate, setFilterDate] = useState(() => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // yyyy-mm-dd
});


  const navigate = useNavigate();

  // ✅ fetch users from backend
  useEffect(() => {
    api.get('/users').then(res => setUsers(res.data));
  }, []);

  // ✅ socket.io connection
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:4000', {
      transports: ['websocket']
    });
    socket.emit('register_admin');

    socket.on('location_update', (payload) => {
      setStatuses(prev => ({ ...prev, [payload.userId]: 'tracking' }));
      // 🔹 live points update sirf agar same user selected hai to
      if (payload.userId === selected) {
        setPoints(prev => [...prev, {
          lat: payload.lat,
          long: payload.long,
          status: payload.status,
          timestamp: payload.timestamp
        }]);
        if (payload.status === 'stationary') {
          setStationary(prev => [...prev, { lat: payload.lat, long: payload.long }]);
        }
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

  // ✅ fetch history on demand (route button press)
  const fetchHistory = async (uid, date) => {
    if (!uid) return;
    let url = `/locations/history/${uid}?sinceHours=48`;
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      url = `/locations/history/${uid}?start=${start.toISOString()}&end=${end.toISOString()}`;
    }
    const res = await api.get(url);
    setPoints(res.data);
    setStationary(res.data.filter(p => p.status === 'stationary'));

    // ✅ user ki geofence bhi fetch karni hai
    const gf = await api.get('/geofences/' + uid);
    setGeofence(gf.data);
  };

  // ✅ route compute only when admin clicks "Show Route"
  const computeRoute = async () => {
    if (!selected) return alert("Select a user first!");
    await fetchHistory(selected, filterDate);

    if (!points.length) return;

    if (geofence) {
      const last = points[points.length - 1];
      const start = [last.long, last.lat];
      const end = [geofence.targetLong, geofence.targetLat];
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start.join(',')};${end.join(',')}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const json = await res.json();
        const coords = json.routes?.[0]?.geometry?.coordinates || [];
        setRouteToTarget(coords.map(c => [c[1], c[0]]));
      } catch {
        setRouteToTarget([[last.lat, last.long], [geofence.targetLat, geofence.targetLong]]);
      }
    } else {
      // fallback → show path of selected date
      setRouteToTarget(points.map(p => [p.lat, p.long]));
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    logout();
    navigate('/login');
  };

  // ✅ sirf active users list me dikhaye (tracking on)
  const activeUsers = users.filter(u => statuses[u._id] === 'tracking');

  // ✅ agar search ho to search ke according show kare
  const searchedUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ final user list (agar search hai to wahi, warna active users)
  const finalUsers = search ? searchedUsers : activeUsers;

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* 🔹 Search + Date Filter */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-xl w-1/3"
        />
        <input
          type="date"
          value={filterDate}
          onChange={e => setFilterDate(e.target.value)}
          className="border px-3 py-2 rounded-xl"
        />
        <button
          onClick={computeRoute}
          className="px-4 py-2 rounded-xl bg-black text-white"
        >
          Show Route
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <UserList
          users={finalUsers}
          selected={selected}
          onSelect={setSelected}   // ✅ sirf select karega, route auto fetch nahi hoga
          statuses={statuses}
        />
        <div className="md:col-span-2 space-y-4">
          <MapView
            points={points}
            stationary={stationary}
            geofence={geofence}
            routeToTarget={routeToTarget}
          />
          <GeofencePanel userId={selected} onUpdated={setGeofence} />
        </div>
      </div>
    </div>
  );
}
