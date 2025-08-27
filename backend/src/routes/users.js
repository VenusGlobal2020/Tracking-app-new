import { Router } from 'express';
import User from '../models/User.js';
import { authRequired, roleRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, roleRequired('admin'), async (req, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
  res.json(users);
});

export default router;
