/*
Owned by Person 4
MODULE: Reports Page
*/

import Navbar from '../../components/common/Navbar';
import UploadForm from '../../components/reports/UploadForm';

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">Community Reports</h1>
        <UploadForm />
      </main>
    </div>
  );
}
