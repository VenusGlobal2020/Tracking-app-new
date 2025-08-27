import { Router } from 'express';
import Geofence from '../models/Geofence.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.get('/:userId', authRequired, roleRequired('admin'), async (req, res) => {
  const { userId } = req.params;
  const gf = await Geofence.findOne({ userId });
  res.json(gf);
});

router.post('/:userId', authRequired, roleRequired('admin'), async (req, res) => {
  const { userId } = req.params;
  const { targetLat, targetLong, radius, status='active' } = req.body;
  const up = await Geofence.findOneAndUpdate({ userId }, { targetLat, targetLong, radius, status }, { new: true, upsert: true });
  req.io.to('admins').emit('geofence_update', { userId, geofence: up });
  res.json(up);
});

router.delete('/:userId', authRequired, roleRequired('admin'), async (req, res) => {
  const { userId } = req.params;
  await Geofence.findOneAndDelete({ userId });
  req.io.to('admins').emit('geofence_update', { userId, geofence: null });
  res.json({ ok: true });
});

export default router;
