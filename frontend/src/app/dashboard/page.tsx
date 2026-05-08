/*
Owned by Person 4
MODULE: Dashboard Page
*/

import Navbar from '../../components/common/Navbar';
import AnalyticsCards from '../../components/dashboard/AnalyticsCards';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">City Intelligence Dashboard</h1>
        <AnalyticsCards />
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-100 min-h-[400px]">
          <p className="text-slate-500">Charts and detailed analytics will appear here.</p>
        </div>
      </main>
    </div>
  );
}
