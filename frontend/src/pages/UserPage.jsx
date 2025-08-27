import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api.js';

export default function UserPage() {
  const [tracking, setTracking] = useState(false);
  const watchId = useRef(null);

  const sendLocation = async ({ coords }) => {
    const { latitude, longitude, speed } = coords;
    const status = (speed && speed > 0.5) ? 'moving' : 'stationary';
    try {
      await api.post('/locations', { lat: latitude, long: longitude, status, timestamp: new Date().toISOString() });
    } catch (e) {
      console.error('Failed sending location', e);
    }
  };

  const start = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported');
    if (tracking) return;
    watchId.current = navigator.geolocation.watchPosition(sendLocation, console.error, { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 });
    setTracking(true);
  };

  const stop = () => {
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    watchId.current = null;
    setTracking(false);
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="bg-white rounded-2xl shadow p-6 w-full max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">User Page</h1>
        <div className="space-x-3">
          <button onClick={start} className="px-4 py-2 rounded-xl bg-black text-white">Start Tracking</button>
          <button onClick={stop} className="px-4 py-2 rounded-xl bg-gray-200">Stop</button>
        </div>
        <p className="text-sm text-gray-600">Tracking: <b>{tracking ? 'ON' : 'OFF'}</b></p>
      </div>
    </div>
  )
}
