import React from 'react';

export default function UserList({ users, selected, onSelect, statuses }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 h-[600px] overflow-auto">
      <h3 className="text-lg font-semibold mb-3"> ACTIVE USERS</h3>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u._id}>
            <button
              className={`w-full text-left px-3 py-2 rounded-xl border ${selected===u._id?'bg-gray-100':''}`}
              onClick={() => onSelect(u._id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${statuses[u._id]==='tracking'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600'}`}>
                  {statuses[u._id] || 'idle'}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
