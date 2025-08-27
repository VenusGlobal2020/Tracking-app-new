# Real-Time Tracking App (Leaflet + React, Express, Socket.IO, MongoDB)

A production-ready starter you can customize and sell. It includes:

- **Frontend**: React (Vite) + Tailwind + React-Leaflet
- **Backend**: Express + Socket.IO + Mongoose + JWT
- **DB**: MongoDB
- **Features**: Auth (Admin/User), real-time tracking, route history, stationary markers, geofencing with entry alerts, and optional OSRM routing to target.

## Monorepo Structure

```
tracker-fullstack-leaflet/
├── backend/
└── frontend/
```

---

## 1) Backend

### Setup

```bash
cd backend
cp .env.example .env
# edit .env and set MONGODB_URI, JWT_SECRET, CORS_ORIGIN
npm install
npm run dev   # or: npm start
```

**.env**

```
MONGODB_URI=mongodb://127.0.0.1:27017/tracking_app
JWT_SECRET=change_this
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

### API

- `POST /api/auth/register` – `{ name, email, password, role: "admin"|"user" }`
- `POST /api/auth/login` – `{ email, password }` → `{ token, role, name, id }`
- `GET  /api/users` (Admin only) – list users
- `POST /api/locations` (Authenticated user) – save + broadcast a location `{ lat, long, status }`
  - dedupes when `status="stationary"` and coords are unchanged.
- `GET  /api/locations/history/:userId?sinceHours=24` – route history
- `GET/POST/DELETE /api/geofences/:userId` (Admin) – manage geofence

**Socket.IO events**

- Client (admin): `register_admin`
- Server → admins: `location_update`, `geofence_enter`, `geofence_update`

---

## 2) Frontend

### Setup

```bash
cd frontend
npm install
# set server url for dev if needed:
# echo "VITE_SERVER_URL=http://localhost:4000" > .env
npm run dev
```

### Pages

- `/login` – login form
- `/register` – register with role dropdown (Admin/User)
- `/admin` – admin dashboard with user list, live map, stationary markers, geofencing, route history, and "Show Optimal Route"
- `/user` – start/stop tracking (uses browser Geolocation API + sends live updates to backend)

**Map tiles**: uses OpenStreetMap tiles by default.  
**Routing**: uses OSRM public demo endpoint. If it fails, it falls back to a straight line.

---

## Deployment Notes

- Host backend on any Node host (Render, Railway, VPS). Expose `PORT` and set `CORS_ORIGIN` to your frontend domain(s).
- Use MongoDB Atlas and set `MONGODB_URI` accordingly (e.g., `mongodb+srv://.../tracking_app`).
- Build frontend with `npm run build` and serve `dist/` via a static host (Netlify/Vercel/Nginx). Set `VITE_SERVER_URL` to the backend URL.
- For commercial polish, add HTTPS, domain, auth rate limiting, and email verification.

---

## Security

- Passwords hashed with bcrypt.
- JWT-based auth with middleware and role checks.
- CORS is configurable via env.

---

## License

You own your deployed instance. Review third-party tile/routing service terms before commercial use.
