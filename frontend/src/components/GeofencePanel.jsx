import React, { useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export default function GeofencePanel({ token, userId, onUpdated }) {
  const [targetLat, setTargetLat] = useState('');
  const [targetLong, setTargetLong] = useState('');
  const [radius, setRadius] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await api.get('/geofences/'+userId);
        if (res.data) {
          setTargetLat(res.data.targetLat);
          setTargetLong(res.data.targetLong);
          setRadius(res.data.radius);
        } else {
          setTargetLat(''); setTargetLong(''); setRadius('');
        }
      } catch {}
    })();
  }, [userId]);

  const save = async () => {
    setLoading(true);
    try {
      const res = await api.post('/geofences/'+userId, {
        targetLat: Number(targetLat), targetLong: Number(targetLong), radius: Number(radius)
      });
      onUpdated?.(res.data);
    } finally { setLoading(false); }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await api.delete('/geofences/'+userId);
      onUpdated?.(null);
      setTargetLat(''); setTargetLong(''); setRadius('');
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-3">Geofencing</h3>
      <div className="grid grid-cols-3 gap-3">
        <input value={targetLat} onChange={e=>setTargetLat(e.target.value)} placeholder="Target Lat" className="border rounded-xl px-3 py-2" />
        <input value={targetLong} onChange={e=>setTargetLong(e.target.value)} placeholder="Target Long" className="border rounded-xl px-3 py-2" />
        <input value={radius} onChange={e=>setRadius(e.target.value)} placeholder="Radius (m)" className="border rounded-xl px-3 py-2" />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={save} disabled={loading || !userId} className="px-4 py-2 rounded-xl bg-black text-white">Save</button>
        <button onClick={remove} disabled={loading || !userId} className="px-4 py-2 rounded-xl bg-gray-200">Remove</button>
      </div>
    </div>
  )
}
