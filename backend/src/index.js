import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import locationRoutes from './routes/locations.js';
import geofenceRoutes from './routes/geofences.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
    credentials: true
  }
});

// attach io to req in routes
app.use((req, res, next) => { req.io = io; next(); });

app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));

// Health
app.get('/', (req, res) => res.json({ ok: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/geofences', geofenceRoutes);

// Socket rooms: admins join 'admins'
io.on('connection', (socket) => {
  socket.on('register_admin', () => {
    socket.join('admins');
  });
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tracking_app';

connectDB(MONGODB_URI).then(() => {
  server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
});
