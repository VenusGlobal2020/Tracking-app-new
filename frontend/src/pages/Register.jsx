import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await register({ name, email, password, role });
      nav('/login');
    } catch (e) {
      setError(e.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Register</h1>
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <div>
            <label className="text-sm block mb-1">Role</label>
            <select className="w-full border rounded-xl px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button className="w-full py-2 rounded-xl bg-black text-white">Create account</button>
        </form>
      </div>
    </div>
  );
}
