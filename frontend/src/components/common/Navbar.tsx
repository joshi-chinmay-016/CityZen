/*
====================================================
OWNER: Loki
MODULE: Dashboard & Frontend Integration

RESPONSIBILITIES:
- Dashboard UI
- Analytics
- Shared UI Components
- Frontend Integration
- UI Polish
====================================================
*/

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
      <div className="text-xl font-bold text-indigo-600">CityZen</div>
      <div className="flex gap-4">
        <Link className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600" href="/dashboard">Dashboard</Link>
        <Link className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600" href="/map">Map</Link>
        <Link className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-indigo-600" href="/reports">Reports</Link>
      </div>
    </nav>
  );
}
