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

export default function AnalyticsCards() {
  const stats = [
    { label: 'Total Reports', value: '1,284', delta: '+12%', color: 'text-blue-600' },
    { label: 'Active Hazards', value: '42', delta: '-5%', color: 'text-orange-600' },
    { label: 'Safe Routes', value: '89%', delta: '+3%', color: 'text-green-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs font-semibold text-slate-400">{stat.delta}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
