import { Router } from 'express';
import Location from '../models/Location.js';
import { authRequired } from '../middleware/auth.js';
import { checkGeofenceEntry } from '../services/geofence.js';

const router = Router();

// Save an incoming location point (from user)
router.post('/', authRequired, async (req, res) => {
  try {
    const { lat, long, status, timestamp } = req.body;
    if (typeof lat !== 'number' || typeof long !== 'number' || !status) {
      return res.status(400).json({ message: 'Invalid payload' });
    }
    const userId = req.user.id;

    const last = await Location.findOne({ userId }).sort({ timestamp: -1 });
    if (last && status === 'stationary') {
      const sameSpot = Math.abs(last.lat - lat) < 1e-5 &&
                       Math.abs(last.long - long) < 1e-5 &&
                       last.status === 'stationary';
      if (sameSpot) {
        req.io.to('admins').emit('location_update', {
          userId,
          lat,
          long,
          status,
          timestamp: timestamp || new Date().toISOString(),
          duplicate: true
        });
        return res.json({ skipped: true });
      }
    }

    const loc = await Location.create({
      userId,
      lat,
      long,
      status,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    const { inside, geofence } = await checkGeofenceEntry(userId, lat, long);
    if (inside) {
      req.io.to('admins').emit('geofence_enter', {
        userId,
        geofenceId: geofence._id,
        lat,
        long,
        at: Date.now()
      });
    }

    req.io.to('admins').emit('location_update', {
      userId,
      lat,
      long,
      status,
      timestamp: loc.timestamp
    });

    res.json({ id: loc._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Get route history (with optional start & end date)
router.get('/history/:userId', authRequired, async (req, res) => {
  try {
    const { userId } = req.params;
    const { sinceHours, start, end } = req.query;

    let query = { userId };

    if (start && end) {
      query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
    } else if (sinceHours) {
      const since = new Date(Date.now() - Number(sinceHours) * 3600 * 1000);
      query.timestamp = { $gte: since };
    }

    const points = await Location.find(query).sort({ timestamp: 1 });
    res.json(points.map(p => ({
      lat: p.lat,
      long: p.long,
      status: p.status,
      timestamp: p.timestamp
    })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
